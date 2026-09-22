import React, { useState, useMemo } from "react";
import { Car, Zap, Accessibility, Gauge, X, CheckCircle, Ticket as TicketIcon } from "lucide-react";

const RATES = { hatch: 30, sedan: 40, suv: 55, bike: 15 };
const SURCHARGE = { hatch: 0, sedan: 5, suv: 15, bike: 0 };
const VEHICLE_LABEL = { hatch: "Hatchback", sedan: "Sedan", suv: "SUV", bike: "Two-wheeler" };

const TYPE_META = {
  regular: { label: "Regular", Icon: Car },
  compact: { label: "Compact", Icon: Gauge },
  ev: { label: "EV Charging", Icon: Zap },
  accessible: { label: "Accessible", Icon: Accessibility },
};

const LEVELS = ["P1", "P2", "P3"];
const TYPE_CYCLE = [
  "regular", "regular", "compact", "regular",
  "ev", "regular", "accessible", "regular",
  "compact", "regular", "regular", "ev"
];

function seedStatus(seed) {
  // deterministic pseudo-random so layout doesn't jump on re-render
  const r = (Math.sin(seed * 999) + 1) / 2;
  if (r < 0.45) return "free";
  if (r < 0.8) return "occupied";
  return "reserved";
}

function buildGarage() {
  const garage = {};
  LEVELS.forEach((lvl, li) => {
    garage[lvl] = [];
    for (let i = 1; i <= 18; i++) {
      const seed = li * 100 + i;
      garage[lvl].push({
        id: `${lvl}-${String(i).padStart(2, "0")}`,
        type: TYPE_CYCLE[(i - 1) % TYPE_CYCLE.length],
        status: seedStatus(seed),
      });
    }
  });
  return garage;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ParkingBooking() {
  const [garage, setGarage] = useState(buildGarage);
  const [level, setLevel] = useState("P1");
  const [filter, setFilter] = useState("all");
  const [selectedBay, setSelectedBay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    vehicleNo: "",
    vehicleType: "hatch",
    duration: "2",
    entryDate: todayStr(),
    entryTime: nowStr(),
    driverName: "",
    phone: "",
  });
  const [formErr, setFormErr] = useState("");

  const bays = garage[level] || [];
  const visibleBays = useMemo(
    () => bays.filter((b) => filter === "all" || b.type === filter),
    [bays, filter]
  );

  const stats = useMemo(
    () => ({
      free: bays.filter((b) => b.status === "free").length,
      occupied: bays.filter((b) => b.status === "occupied").length,
      reserved: bays.filter((b) => b.status === "reserved").length,
    }),
    [bays]
  );

  const price = useMemo(() => {
    const hrs = parseInt(form.duration, 10) || 1;
    const base = RATES[form.vehicleType] * hrs;
    const sur = SURCHARGE[form.vehicleType] * hrs;
    return { base, sur, total: base + sur };
  }, [form.duration, form.vehicleType]);

  function openBooking(bay) {
    if (bay.status !== "free") return;
    setSelectedBay(bay);
    setForm({
      vehicleNo: "",
      vehicleType: "hatch",
      duration: "2",
      entryDate: todayStr(),
      entryTime: nowStr(),
      driverName: "",
      phone: "",
    });
    setFormErr("");
    setShowModal(true);
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    if (!form.vehicleNo.trim()) return "Enter vehicle number.";
    if (!form.driverName.trim()) return "Enter driver name.";
    if (!/^\d{10}$/.test(form.phone.trim())) return "Enter a valid 10-digit phone number.";
    if (!form.entryDate || !form.entryTime) return "Set entry date and time.";
    return "";
  }

  function confirmBooking() {
    const err = validate();
    if (err) {
      setFormErr(err);
      return;
    }
    setFormErr("");
    
    // Update bay status
    setGarage((g) => {
      const next = {
        ...g,
        [level]: g[level].map((b) =>
          b.id === selectedBay.id ? { ...b, status: "reserved" } : b
        ),
      };
      return next;
    });

    const newTicket = {
      ticketId: `TKN-${Math.floor(100000 + Math.random() * 900000)}`,
      bayId: selectedBay.id,
      ...form,
      totalPrice: price.total,
      bookedAt: `${nowStr()} ${todayStr()}`,
    };

    setTicket(newTicket);
    setShowModal(false);
    showNotification(`Bay ${selectedBay.id} reserved successfully!`);
  }

  function showNotification(msg) {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 4000);
  }

  return (
    <div className="terminal-wrapper">
      {/* Toast Banner */}
      {toast && (
        <div className="toast-banner">
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="terminal-header">
        <div className="brand-title">
          <div className="brand-logo">P</div>
          <div className="brand-text">
            <h1>PARKBAY</h1>
            <p>AUTOMATED BAY RESERVATION · GARAGE TERMINAL</p>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-box">
            <span className="stat-number stat-free">{stats.free}</span>
            <span className="stat-label">FREE</span>
          </div>
          <div className="stat-box">
            <span className="stat-number stat-occupied">{stats.occupied}</span>
            <span className="stat-label">OCCUPIED</span>
          </div>
          <div className="stat-box">
            <span className="stat-number stat-reserved">{stats.reserved}</span>
            <span className="stat-label">RESERVED</span>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="controls-bar">
        {/* Level Selector */}
        <div className="level-tabs">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              className={`level-tab ${level === lvl ? "active" : ""}`}
              onClick={() => setLevel(lvl)}
            >
              LEVEL {lvl}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button
            className={`filter-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            ALL TYPES
          </button>
          {Object.entries(TYPE_META).map(([key, meta]) => (
            <button
              key={key}
              className={`filter-pill ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {meta.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="legend-box">
          <span className="legend-item"><span className="dot dot-free"></span> Free</span>
          <span className="legend-item"><span className="dot dot-occupied"></span> Occupied</span>
          <span className="legend-item"><span className="dot dot-reserved"></span> Reserved</span>
        </div>
      </div>

      {/* Bays Grid */}
      <div className="bays-grid">
        {visibleBays.map((bay) => {
          const meta = TYPE_META[bay.type] || TYPE_META.regular;
          const IconComp = meta.Icon;
          const isFree = bay.status === "free";
          return (
            <div
              key={bay.id}
              className={`bay-card status-${bay.status} ${isFree ? "clickable" : ""}`}
              onClick={() => openBooking(bay)}
              title={isFree ? "Click to Reserve" : `Status: ${bay.status}`}
            >
              <div className="bay-icon">
                <IconComp size={24} />
              </div>
              <div className="bay-id">{bay.id}</div>
              <div className="bay-type">{meta.label.toUpperCase()}</div>
              <div className={`bay-status-badge badge-${bay.status}`}>
                {bay.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Ticket Card */}
      {ticket && (
        <div className="ticket-display">
          <div className="ticket-header">
            <TicketIcon size={20} />
            <span>Active Ticket: {ticket.ticketId}</span>
            <button className="ticket-close" onClick={() => setTicket(null)}>×</button>
          </div>
          <div className="ticket-body">
            <div><strong>Bay:</strong> {ticket.bayId}</div>
            <div><strong>Driver:</strong> {ticket.driverName}</div>
            <div><strong>Vehicle:</strong> {ticket.vehicleNo} ({VEHICLE_LABEL[ticket.vehicleType]})</div>
            <div><strong>Duration:</strong> {ticket.duration} hrs</div>
            <div><strong>Amount Paid:</strong> ₹{ticket.totalPrice}</div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showModal && selectedBay && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reserve Parking Bay: {selectedBay.id}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {formErr && <div className="form-error">{formErr}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. KA-01-AB-1234"
                    value={form.vehicleNo}
                    onChange={(e) => updateForm("vehicleNo", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) => updateForm("vehicleType", e.target.value)}
                  >
                    {Object.entries(VEHICLE_LABEL).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label} (₹{RATES[key]}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (Hours)</label>
                  <select
                    value={form.duration}
                    onChange={(e) => updateForm("duration", e.target.value)}
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Driver Name *</label>
                  <input
                    type="text"
                    placeholder="Driver's Full Name"
                    value={form.driverName}
                    onChange={(e) => updateForm("driverName", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone (10-digits) *</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Entry Date</label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => updateForm("entryDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="price-summary-box">
                <div className="price-row">
                  <span>Base Rate:</span>
                  <span>₹{price.base}</span>
                </div>
                {price.sur > 0 && (
                  <div className="price-row">
                    <span>Type Surcharge:</span>
                    <span>₹{price.sur}</span>
                  </div>
                )}
                <div className="price-row total-row">
                  <span>Total Fee:</span>
                  <span className="total-amount">₹{price.total}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmBooking}>
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
