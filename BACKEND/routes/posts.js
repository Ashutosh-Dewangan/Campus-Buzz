console.log("posts.js loaded");
const express = require("express");
const router = express.Router();

let posts = [
    {
        user: "Rahul",
        title: "Cab for railway station",
        content: "Cab booked at 5PM",
        image: "",
        hashtag: "#cabsplit",
        owner: "Rahul Khatri"
    },
    {
        user: "Aman",
        title: "Hackathon 3.0 by TCP",
        content: "Hackathon registrations are open.",
        image: "",
        hashtag: "#events",
        owner: "Aman Sharma"
    },

    {
        user: "Harshita",
        title: "Keys Found",
        content: "Found: Set of keys near CCC.",
        image: "",
        hashtag: "#found",
        owner: "Harshita Patel"
    },
    {
        user: "Ananya",
        title: "Dosa party !!!!",
        content: "Dosa party at Hostel 1 room 111",
        image: "",
        hashtag: "#foodsplit",
        owner: "Ananya Pathak"
    }

];

// GET all posts
router.get("/", (req, res) => {
    res.json(posts);
});

// Add a post
router.post("/", (req, res) => {

    const newPost = {
        user: req.body.user,
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
        owner: req.body.owner,
        expiry: req.body.expiry || null
    };

    posts.unshift(newPost);

    res.status(201).json({
        success: true,
        message: "Post added successfully",
        post: newPost
    });
});

module.exports = router;
