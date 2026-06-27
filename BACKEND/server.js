const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware — order matters in Express!
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// FIX: Register API routes BEFORE static files so /api/* never gets served as a file
const postRoutes = require("./routes/posts");
const eventRoutes = require("./routes/events");
const complaintRoutes = require("./routes/complaints");

app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/complaints", complaintRoutes);

// FIX: Static files AFTER API routes — this is the correct order.
// If the browser requests /, express.static serves index.html automatically.
app.use(express.static(path.join(__dirname, "../FRONTEND")));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
