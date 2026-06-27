const express = require("express");
const router = express.Router();

console.log("complaints.js loaded");

let complaints = [
    {
        title: "A/C not working",
        text: "The air conditioner in room F42 is not functioning properly.",
        location: "Room F42",
        status: "In Progress",
        owner: "student1@nitrr.ac.in"
    },
    {
        title: "Stray dogs in the campus",
        text: "There are stray dogs roaming around the campus and they are a danger to students.",
        location: "Central Park, Main Ground",
        status: "Pending",
        owner: "student2@nitrr.ac.in"
    }
];

router.get("/", (req, res) => {
    res.json(complaints);
});


router.post("/", (req, res) => {

    console.log("POST /complaints");
    console.log(req.body);
    const newComplaint = {
        title: req.body.title,
        text: req.body.text,
        location: req.body.location || "",
        status: req.body.status || "Pending",
        owner: req.body.owner
    };

    complaints.unshift(newComplaint);

    res.status(201).json({
        success: true,
        message: "Complaint added successfully",
        complaint: newComplaint
    });
});

module.exports = router;
