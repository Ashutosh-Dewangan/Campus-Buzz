const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from FRONTEND directory
app.use(express.static(path.join(__dirname, "../FRONTEND")));

// Logging middleware
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

// Routes
const postRoutes = require("./routes/posts");
const eventRoutes = require("./routes/events");
const complaintRoutes = require("./routes/complaints");

console.log("Post routes loaded:", postRoutes);
console.log("Events routes loaded:", eventRoutes);
console.log("Complaints route loaded:", complaintRoutes);

// Register routes under /api to avoid collisions with static files
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/complaints", complaintRoutes);

// Test route
app.get("/test", (req, res) => {
    res.send("Test route works!");
});

// Serve feed.html for /abc endpoint
app.get("/abc", (req, res) => {
    res.sendFile(path.join(__dirname, "../FRONTEND/feed.html"));
});

// Debug route
app.get("/where", (req, res) => {
    res.send(path.join(__dirname, "../FRONTEND"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
