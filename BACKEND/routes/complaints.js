const express = require("express");
const router = express.Router();
const { complaints, nextId } = require("../data");
const roleGate = require("../middleware/roleGate");
// GET all complaints
// Admin sees owner field. Everyone else gets it stripped (anonymous).
router.get("/", (req, res) => {
    const callerRole = req.headers["x-user-role"];
    if (callerRole === "Admin") {
        // Admin sees everything including real identity
        return res.json(complaints);
    }
    // Non-admin: strip the owner field for anonymity
    const publicComplaints = complaints.map(c => {
        const { owner, ...publicData } = c;
        return publicData;
    });
    res.json(publicComplaints);
});
// POST — submit a complaint (Students only)
router.post("/", roleGate(["Student"]), (req, res) => {
    const { title, text, location, owner } = req.body;
    if (!title || !text) {
        return res.status(400).json({ success: false, error: "title and text are required." });
    }
    const newComplaint = {
        id: nextId.complaints++,
        title,
        text,
        location: location || "",
        status: "Pending",
        owner,  // stored for admin visibility, never shown publicly
        createdAt: new Date().toISOString()
    };
    complaints.unshift(newComplaint);
    res.status(201).json({ success: true, complaint: { ...newComplaint, owner: undefined } });
});
// PUT /api/complaints/:id — mark as resolved (owner or Admin)
router.put("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Complaint not found." });
    const callerEmail = req.headers["x-user-email"];
    const callerRole  = req.headers["x-user-role"];
    // Only the original poster or an Admin can resolve
    if (callerRole !== "Admin" && complaints[idx].owner !== callerEmail) {
        return res.status(403).json({ success: false, error: "You can only resolve your own complaints." });
    }
    complaints[idx].status = req.body.status || "Resolved";
    res.json({ success: true, message: "Complaint updated.", status: complaints[idx].status });
});
// DELETE /api/complaints/:id — Admin only (moderation)
router.delete("/:id", roleGate(["Admin"]), (req, res) => {
    const id = parseInt(req.params.id);
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Complaint not found." });
    complaints.splice(idx, 1);
    res.json({ success: true, message: "Complaint removed by admin." });
});
module.exports = router;