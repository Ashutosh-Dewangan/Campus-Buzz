const express = require("express");

const router = express.Router();

let nextEventId = 2;

let events = [
    {
        id: 1,
        day: 7,
        title: "Hackathon",
        date: "7 July 2026",
        time: "09:00",
        venue: "Auditorium",
        description: "24-hour coding challenge.",
        club: "Coding Club",
        registration: "Register at the Coding Club desk."
    }
];

function cleanText(value) {
    return String(value || "").trim();
}

router.get("/", (req, res) => {
    res.json(events);
});

router.post("/", (req, res) => {
    const day = Number(req.body.day);
    const title = cleanText(req.body.title);
    const date = cleanText(req.body.date);
    const time = cleanText(req.body.time);
    const venue = cleanText(req.body.venue);
    const description = cleanText(req.body.description);
    const club = cleanText(req.body.club);
    const registration = cleanText(req.body.registration);

    if (!Number.isInteger(day) || day < 1 || day > 31 || !title || !date || !time || !venue || !description || !club) {
        return res.status(400).json({
            success: false,
            message: "Day, title, date, time, venue, description, and club are required."
        });
    }

    const newEvent = {
        id: nextEventId++,
        day,
        title,
        date,
        time,
        venue,
        description,
        club,
        registration
    };

    events.unshift(newEvent);

    return res.status(201).json({
        success: true,
        message: "Event added successfully.",
        event: newEvent
    });
});

module.exports = router;
