# Stage 1: Build React Application
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve React Application using Nginx
FROM nginx:alpine
# Make Nginx listen on both port 80 and 5173 for compatibility
RUN sed -i 's/listen  *80;/listen 80;\n    listen 5173;/' /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80 5173
CMD ["nginx", "-g", "daemon off;"]
