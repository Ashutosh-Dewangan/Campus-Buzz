const express = require("express");
const router = express.Router();

let events = [
    {
        day: 7,
        title: "Football League Finals",
        date: "7 July 2026",
        time: "4:00 PM",
        venue: "Sports Complex",
        description: "Final matches of the football league. Cheer for your favorite teams!",
        club: "SAMAR The Sports Club",
        registration: ""
    },
    {
        day: 15,
        title: "Music Concert",
        date: "15 July 2026",
        time: "6:00 PM",
        venue: "Open Ground",
        description: "Live music performance by local bands. Bring your friends and enjoy the evening!",
        club: "RAAGA The Music Club",
        registration: ""
    },
    {
        day: 20,
        title: "Workshop on Web Development",
        date: "20 July 2026",
        time: "10:00 AM",
        venue: "Computer Lab 1",
        description: "Hands-on workshop to learn web development basics. Limited seats available, register early!",
        club: "Turing Club of Programmers",
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
