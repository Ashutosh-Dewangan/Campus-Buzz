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
// POST /api/events/:id/rsvp
router.post("/:id/rsvp", (req, res) => {
    const id = parseInt(req.params.id);
    const { email, status } = req.body;
    if (!email || !status) {
        return res.status(400).json({ success: false, error: "email and status are required." });
    }
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, error: "Event not found." });
    }
    const event = events[idx];
    
    // Init rsvps arrays if they don't exist
    if (!event.rsvps) {
        event.rsvps = { going: [], interested: [] };
    }
    
    // Remove user email from both lists first
    event.rsvps.going = event.rsvps.going.filter(e => e !== email);
    event.rsvps.interested = event.rsvps.interested.filter(e => e !== email);
    
    // Add to selected list
    if (status === "going") {
        event.rsvps.going.push(email);
    } else if (status === "interested") {
        event.rsvps.interested.push(email);
    }
    
    res.json({ success: true, event });
});

module.exports = router;
