const express = require("express");
const router = express.Router();

console.log("complaints.js loaded");

let complaints = [
    {
        title: "Broken Fan",
        text: "The fan in Room 204 is not working.",
        location: "Room 204",
        status: "Pending",
        owner: "student1@nitrr.ac.in"
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
