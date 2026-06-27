const express = require("express");
const cors = require("cors");
const path = require("path");

const postRoutes = require("./routes/posts");
const eventRoutes = require("./routes/events");
const complaintRoutes = require("./routes/complaints");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Campus Buzz server is running" });
});

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found." });
});

app.use(express.static(path.join(__dirname, "../FRONTEND")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../FRONTEND/index.html"));
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
}

module.exports = app;
