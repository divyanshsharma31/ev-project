# ===== Stage 1: Build React frontend =====
FROM node:18 AS frontend-builder

WORKDIR /app
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# ===== Stage 2: Set up backend =====
FROM node:18

WORKDIR /app

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build output to backend/public
COPY --from=frontend-builder /app/frontend/build ./backend/public/

# Install backend dependencies
RUN cd backend && npm install

EXPOSE 5000
CMD ["node", "backend/server.js"]
