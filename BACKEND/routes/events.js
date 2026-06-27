const express = require("express");
const router = express.Router();
const { events, nextId } = require("../data");
const roleGate = require("../middleware/roleGate");
// GET all events (everyone)
router.get("/", (req, res) => {
    res.json(events);
});
// POST — create event (Club member and Admin only, enforced server-side)
router.post("/", roleGate(["Club member", "Admin"]), (req, res) => {
    const { day, title, date, time, venue, description, club, registration } = req.body;
    if (!title || !date || !time || !venue) {
        return res.status(400).json({
            success: false,
            error: "title, date, time and venue are required."
        });
    }
    const newEvent = {
        id: nextId.events++,
        day: day || new Date(date).getDate(),
        title,
        date,
        time,
        venue,
        description: description || "",
        club: club || "",
        registration: registration || "",
        createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    res.status(201).json({ success: true, event: newEvent });
});
// DELETE /api/events/:id — Club/Admin only
router.delete("/:id", roleGate(["Club member", "Admin"]), (req, res) => {
    const id = parseInt(req.params.id);
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Event not found." });
    events.splice(idx, 1);
    res.json({ success: true, message: "Event deleted." });
});
module.exports = router;
