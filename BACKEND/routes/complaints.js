const express = require("express");

const router = express.Router();

const validStatuses = new Set(["Pending", "In Progress", "Resolved"]);

let nextComplaintId = 2;

let complaints = [
    {
        id: 1,
        title: "Broken Fan",
        text: "The fan in Room 204 is not working.",
        category: "Infrastructure",
        location: "Room 204",
        status: "Pending",
        owner: "student1@nitrr.ac.in"
    }
];

function cleanText(value) {
    return String(value || "").trim();
}

router.get("/", (req, res) => {
    res.json(complaints);
});

router.post("/", (req, res) => {
    const title = cleanText(req.body.title);
    const text = cleanText(req.body.text);
    const category = cleanText(req.body.category);
    const location = cleanText(req.body.location);
    const owner = cleanText(req.body.owner);
    const status = cleanText(req.body.status) || "Pending";

    if (!title || !text || !category || !owner) {
        return res.status(400).json({
            success: false,
            message: "Title, description, category, and owner are required."
        });
    }

    if (!validStatuses.has(status)) {
        return res.status(400).json({
            success: false,
            message: "Complaint status is invalid."
        });
    }

    const newComplaint = {
        id: nextComplaintId++,
        title,
        text,
        category,
        location,
        status,
        owner
    };

    complaints.unshift(newComplaint);

    return res.status(201).json({
        success: true,
        message: "Complaint added successfully.",
        complaint: newComplaint
    });
});

router.patch("/:id", (req, res) => {
    const complaintId = Number(req.params.id);
    const complaint = complaints.find((item) => item.id === complaintId);
    const status = cleanText(req.body.status);

    if (!complaint) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    if (!validStatuses.has(status)) {
        return res.status(400).json({
            success: false,
            message: "Complaint status is invalid."
        });
    }

    complaint.status = status;

    return res.json({
        success: true,
        message: "Complaint updated successfully.",
        complaint
    });
});

module.exports = router;
