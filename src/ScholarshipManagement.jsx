import React, { useState, useMemo } from "react";
import { Award, GraduationCap, DollarSign, FileText, CheckCircle, Search, Filter, X, Clock, BookOpen, Globe, UserCheck } from "lucide-react";

const SCHOLARSHIP_CATEGORIES = {
  merit: { label: "Merit-Based", Icon: Award },
  need: { label: "Need-Based", Icon: DollarSign },
  tech: { label: "STEM & Tech", Icon: BookOpen },
  international: { label: "International", Icon: Globe },
};

const INITIAL_SCHOLARSHIPS = [
  {
    id: "SCH-101",
    title: "National Merit Excellence Grant",
    category: "merit",
    amount: 75000,
    minGpa: 8.5,
    maxIncome: 800000,
    deadline: "2026-10-15",
    status: "open",
    description: "Awarded to top 5% academic rank holders in engineering & science streams.",
  },
  {
    id: "SCH-102",
    title: "EWS Financial Assistance Aid",
    category: "need",
    amount: 50000,
    minGpa: 6.5,
    maxIncome: 300000,
    deadline: "2026-11-01",
    status: "open",
    description: "Financial assistance for economically weaker section students pursuing higher education.",
  },
  {
    id: "SCH-103",
    title: "STEM Women Innovators Fellowship",
    category: "tech",
    amount: 100000,
    minGpa: 8.0,
    maxIncome: 1000000,
    deadline: "2026-10-30",
    status: "open",
    description: "Encouraging female scholars pursuing Artificial Intelligence, DevOps, & Data Science.",
  },
  {
    id: "SCH-104",
    title: "Global Higher Studies Exchange Scholarship",
    category: "international",
    amount: 150000,
    minGpa: 9.0,
    maxIncome: 1200000,
    deadline: "2026-12-15",
    status: "open",
    description: "Partial funding for international research internships and global exchange programs.",
  },
  {
    id: "SCH-105",
    title: "DevOps & Cloud Computing Leadership Grant",
    category: "tech",
    amount: 60000,
    minGpa: 7.5,
    maxIncome: 600000,
    deadline: "2026-09-30",
    status: "under_review",
    description: "Specialized grant for undergraduate projects in containerization & CI/CD automation.",
  },
  {
    id: "SCH-106",
    title: "First-Generation Graduate Support Scheme",
    category: "need",
    amount: 45000,
    minGpa: 7.0,
    maxIncome: 250000,
    deadline: "2026-10-20",
    status: "open",
    description: "Empowering first-generation college graduates with full tuition reimbursement.",
  },
  {
    id: "SCH-107",
    title: "Dean's List Academic Distinction Award",
    category: "merit",
    amount: 80000,
    minGpa: 9.2,
    maxIncome: 1500000,
    deadline: "2026-08-31",
    status: "awarded",
    description: "Prestigious annual award recognizing exceptional university-wide academic performance.",
  },
  {
    id: "SCH-108",
    title: "Open Source Contributor Research Fund",
    category: "tech",
    amount: 70000,
    minGpa: 7.8,
    maxIncome: 800000,
    deadline: "2026-11-10",
    status: "open",
    description: "Funding students actively building and contributing to major open-source repositories.",
  }
];

export default function ScholarshipManagement() {
  const [scholarships, setScholarships] = useState(INITIAL_SCHOLARSHIPS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    department: "Computer Science & Engineering",
    gpa: "",
    familyIncome: "",
    email: "",
    phone: "",
    sop: "",
  });
  const [formErr, setFormErr] = useState("");

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: scholarships.length,
      open: scholarships.filter((s) => s.status === "open").length,
      underReview: scholarships.filter((s) => s.status === "under_review").length,
      awarded: scholarships.filter((s) => s.status === "awarded").length,
      totalAmount: scholarships.reduce((acc, s) => acc + s.amount, 0),
    };
  }, [scholarships]);

  // Filtered scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [scholarships, categoryFilter, statusFilter, searchQuery]);

  function openApplicationModal(scheme) {
    if (scheme.status !== "open") return;
    setSelectedScheme(scheme);
    setForm({
      studentName: "",
      studentId: "",
      department: "Computer Science & Engineering",
      gpa: "",
      familyIncome: "",
      email: "",
      phone: "",
      sop: "",
    });
    setFormErr("");
    setShowModal(true);
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateForm() {
    if (!form.studentName.trim()) return "Please enter student full name.";
    if (!form.studentId.trim()) return "Please enter student register/roll number.";
    if (!form.gpa || parseFloat(form.gpa) < 0 || parseFloat(form.gpa) > 10)
      return "Enter a valid GPA (0.0 to 10.0).";
    if (selectedScheme && parseFloat(form.gpa) < selectedScheme.minGpa)
      return `Minimum GPA required for this scholarship is ${selectedScheme.minGpa}.`;
    if (!form.familyIncome || parseFloat(form.familyIncome) <= 0)
      return "Enter valid annual family income.";
    if (selectedScheme && parseFloat(form.familyIncome) > selectedScheme.maxIncome)
      return `Family annual income must be below ₹${selectedScheme.maxIncome.toLocaleString()} for this scheme.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone.trim()))
      return "Enter a valid 10-digit contact number.";
    if (!form.sop.trim() || form.sop.trim().length < 20)
      return "Statement of Purpose (SOP) must be at least 20 characters.";
    return "";
  }

  function handleSubmitApplication() {
    const err = validateForm();
    if (err) {
      setFormErr(err);
      return;
    }
    setFormErr("");

    // Update scholarship status
    setScholarships((prev) =>
      prev.map((s) => (s.id === selectedScheme.id ? { ...s, status: "under_review" } : s))
    );

    const appRef = {
      appId: `APP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      schemeId: selectedScheme.id,
      schemeTitle: selectedScheme.title,
      grantAmount: selectedScheme.amount,
      appliedAt: new Date().toLocaleString(),
      ...form,
    };

    setActiveApplication(appRef);
    setShowModal(false);
    triggerToast(`Application submitted for ${selectedScheme.title}! Ref: ${appRef.appId}`);
  }

  function triggerToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4500);
  }

  return (
    <div className="portal-wrapper">
      {/* Toast banner */}
      {toast && (
        <div className="toast-banner">
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Portal Header */}
      <header className="portal-header">
        <div className="brand-box">
          <div className="brand-icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1>SCHOLARHUB</h1>
            <p>SCHOLARSHIP MANAGEMENT & FINANCIAL AID SYSTEM</p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value val-total">{stats.total}</span>
            <span className="stat-lbl">TOTAL SCHOLARSHIPS</span>
          </div>
          <div className="stat-card">
            <span className="stat-value val-open">{stats.open}</span>
            <span className="stat-lbl">OPEN SCHEMES</span>
          </div>
          <div className="stat-card">
            <span className="stat-value val-review">{stats.underReview}</span>
            <span className="stat-lbl">UNDER REVIEW</span>
          </div>
          <div className="stat-card">
            <span className="stat-value val-awarded">{stats.awarded}</span>
            <span className="stat-lbl">AWARDED GRANTS</span>
          </div>
        </div>
      </header>

      {/* Control Panel: Search & Filters */}
      <div className="control-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search scholarships by title, ID, or criteria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Category Filter Pills */}
          <div className="pill-row">
            <button
              className={`pill ${categoryFilter === "all" ? "active" : ""}`}
              onClick={() => setCategoryFilter("all")}
            >
              ALL CATEGORIES
            </button>
            {Object.entries(SCHOLARSHIP_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                className={`pill ${categoryFilter === key ? "active" : ""}`}
                onClick={() => setCategoryFilter(key)}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="select-wrapper">
            <Filter size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ALL STATUSES</option>
              <option value="open">OPEN FOR APPLICATION</option>
              <option value="under_review">UNDER REVIEW</option>
              <option value="awarded">AWARDED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Submission Card */}
      {activeApplication && (
        <div className="active-app-card">
          <div className="app-card-header">
            <UserCheck size={20} />
            <span>Submitted Application Reference: <strong>{activeApplication.appId}</strong></span>
            <button className="btn-close-app" onClick={() => setActiveApplication(null)}>×</button>
          </div>
          <div className="app-card-grid">
            <div><strong>Student:</strong> {activeApplication.studentName} ({activeApplication.studentId})</div>
            <div><strong>Scholarship:</strong> {activeApplication.schemeTitle}</div>
            <div><strong>Grant Amount:</strong> ₹{activeApplication.grantAmount.toLocaleString()}</div>
            <div><strong>Submitted On:</strong> {activeApplication.appliedAt}</div>
          </div>
        </div>
      )}

      {/* Scholarship Cards Grid */}
      <div className="scholarship-grid">
        {filteredScholarships.length === 0 ? (
          <div className="empty-state">
            <p>No scholarship schemes match your criteria.</p>
          </div>
        ) : (
          filteredScholarships.map((scheme) => {
            const catMeta = SCHOLARSHIP_CATEGORIES[scheme.category] || SCHOLARSHIP_CATEGORIES.merit;
            const CatIcon = catMeta.Icon;
            const isOpen = scheme.status === "open";

            return (
              <div
                key={scheme.id}
                className={`scholarship-card status-${scheme.status}`}
              >
                <div className="card-top">
                  <span className="scheme-id">{scheme.id}</span>
                  <span className={`status-badge badge-${scheme.status}`}>
                    {scheme.status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="scheme-title">{scheme.title}</h3>
                <p className="scheme-desc">{scheme.description}</p>

                <div className="meta-box">
                  <div className="meta-item">
                    <CatIcon size={16} />
                    <span>{catMeta.label}</span>
                  </div>
                  <div className="meta-item amount-highlight">
                    <DollarSign size={16} />
                    <span>₹{scheme.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="criteria-list">
                  <div>• Min GPA: <strong>{scheme.minGpa}</strong></div>
                  <div>• Max Family Income: <strong>₹{scheme.maxIncome.toLocaleString()}/yr</strong></div>
                  <div className="deadline">
                    <Clock size={13} /> Deadline: {scheme.deadline}
                  </div>
                </div>

                <button
                  className={`btn-apply ${isOpen ? "" : "disabled"}`}
                  onClick={() => openApplicationModal(scheme)}
                  disabled={!isOpen}
                >
                  {isOpen ? "Apply Now" : scheme.status === "under_review" ? "Under Review" : "Awarded"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Application Form Modal */}
      {showModal && selectedScheme && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Application for {selectedScheme.id}</h3>
                <p className="modal-subtitle">{selectedScheme.title}</p>
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formErr && <div className="form-error">{formErr}</div>}

              <div className="grant-banner">
                <span>Scholarship Grant Amount:</span>
                <strong>₹{selectedScheme.amount.toLocaleString()}</strong>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter candidate name"
                    value={form.studentName}
                    onChange={(e) => updateForm("studentName", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Register / Roll Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 24104051"
                    value={form.studentId}
                    onChange={(e) => updateForm("studentId", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Department / Stream *</label>
                  <select
                    value={form.department}
                    onChange={(e) => updateForm("department", e.target.value)}
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Electrical & Electronics">EEE</option>
                    <option value="Mechanical Engineering">Mech</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current CGPA (Min: {selectedScheme.minGpa}) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.8"
                    value={form.gpa}
                    onChange={(e) => updateForm("gpa", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Annual Family Income (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 350000"
                    value={form.familyIncome}
                    onChange={(e) => updateForm("familyIncome", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone (10 digits) *</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Statement of Purpose (SOP / Reason for Applying) *</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state academic achievements and financial need..."
                    value={form.sop}
                    onChange={(e) => updateForm("sop", e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmitApplication}>
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
