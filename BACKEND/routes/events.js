const express = require("express");
const router = express.Router();

let events = [
    {
        day: 7,
        title: "Hackathon",
        date: "7 July 2026",
        time: "9:00 AM",
        venue: "Auditorium",
        description: "24-hour coding challenge.",
        club: "Coding Club",
        registration: ""
    }
];

router.get("/", (req, res) => {
    res.json(events);
});

router.post("/", (req, res) => {

    const newEvent = {
        day: req.body.day,
        title: req.body.title,
        date: req.body.date,
        time: req.body.time,
        venue: req.body.venue,
        description: req.body.description,
        club: req.body.club,
        registration: req.body.registration
    };

    events.unshift(newEvent);

    res.status(201).json({
        success: true,
        message: "Event added successfully",
        event: newEvent
    });
    
});

module.exports = router;
