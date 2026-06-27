const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
console.log(__dirname);
console.log(path.join(__dirname, "../FRONTEND"));
app.use(express.static(path.join(__dirname, "../FRONTEND")));


app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

//GET 
const postRoutes = require("./routes/posts");
const eventRoutes = require("./routes/events");
const complaintRoutes = require("./routes/complaints");
console.log("Post routes loaded:", postRoutes);
console.log("Events routes loaded:", eventRoutes);
console.log("Complaints route loaded:", complaintRoutes);


// Add this to server.js
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});
//OTHER
app.use("/posts", postRoutes);
app.use("/events", eventRoutes);
app.use("/complaints", complaintRoutes);


app.get("/test", (req, res) => {
    res.send("Test route works!");
});

app.get("/abc", (req, res) => {
    res.sendFile(path.join(__dirname, "../FRONTEND/feed.html"));
});

app.get("/where", (req, res) => {
    res.send(path.join(__dirname, "../FRONTEND"));
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

