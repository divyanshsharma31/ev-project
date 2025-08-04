# === Stage 1: Build frontend ===
FROM node:18 AS frontend-builder

WORKDIR /app

COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# === Stage 2: Backend with built frontend ===
FROM node:18

WORKDIR /app

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./backend/public/

RUN cd backend && npm install

EXPOSE 5000
CMD ["node", "backend/server.js"]
