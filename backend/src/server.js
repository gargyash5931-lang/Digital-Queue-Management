
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const pool = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();
const server = http.createServer(app);

// ================================
// SOCKET.IO CONFIGURATION
// ================================

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5176",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }
});

// ================================
// MIDDLEWARE
// ================================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5176",
    "https://digital-queue-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make Socket.IO available in controllers
app.set("io", io);

// ================================
// HOME ROUTE
// ================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Digital Queue Management API is running",
        version: "1.0.0"
    });
});

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            server: "Running",
            database: "Connected",
            message: "System is working properly"
        });

    } catch (error) {
        console.error("Database health error:", error);

        res.status(500).json({
            success: false,
            server: "Running",
            database: "Disconnected",
            message: error.message
        });
    }
});

// ================================
// API ROUTES
// ================================

// Authentication
app.use("/api/auth", authRoutes);

// Token generation and tracking
app.use("/api/tokens", tokenRoutes);

// Service listing
app.use("/api/services", serviceRoutes);

// ================================
// SOCKET.IO EVENTS
// ================================

io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    // Join a particular service queue
    socket.on("joinQueue", (serviceId) => {

        if (!serviceId) return;

        socket.join(`queue-${serviceId}`);

        console.log(
            `Client ${socket.id} joined queue ${serviceId}`
        );
    });

    // Leave a particular service queue
    socket.on("leaveQueue", (serviceId) => {

        if (!serviceId) return;

        socket.leave(`queue-${serviceId}`);

        console.log(
            `Client ${socket.id} left queue ${serviceId}`
        );
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });

});

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });

});

// ================================
// GLOBAL ERROR HANDLER
// ================================

app.use((err, req, res, next) => {

    console.error("Server error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });

});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        // Check PostgreSQL connection
        await pool.query("SELECT 1");

        console.log("PostgreSQL connected successfully!");

        server.listen(PORT, () => {

            console.log("");
            console.log("=================================");
            console.log(" DIGITAL QUEUE MANAGEMENT SYSTEM ");
            console.log("=================================");
            console.log(`Backend running: http://localhost:${PORT}`);
            console.log("PostgreSQL connection checked");
            console.log("Socket.IO initialized");
            console.log("Authentication routes initialized");
            console.log("Token routes initialized");
            console.log("Service routes initialized");
            console.log("=================================");

        });

    } catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

        process.exit(1);
    }
}

startServer();

// Handle graceful shutdown
process.on("SIGINT", async () => {

    console.log("Shutting down server...");

    await pool.end();

    server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
    });

});
