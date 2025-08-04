# Step 1: Build frontend (React)
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Step 2: Build backend (Express)
FROM node:18 AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Step 3: Copy frontend build to backend
COPY --from=frontend /app/frontend/build ./backend/build
COPY backend/ ./backend

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]
