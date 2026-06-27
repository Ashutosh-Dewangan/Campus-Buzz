console.log("posts.js loaded");
const express = require("express");
const router = express.Router();

let posts = [
    {
        user: "Rahul Dubey",
        title: "Friendly match",
        content: "Football match at 6 PM! Don't miss out",
        image: "/assets/images/football.jpg",
        hashtag: "#FootballIsLife",
        owner: "Rahul Dubey",
    },
    {
        user: "Aman Sharma",
        title: "Hackathon announcement!",
        content: "Hackathon registrations are open.",
        image: "/assets/images/coding.jpg",
        hashtag: "#Codingggg",
        owner: "Aman Sharma"
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
        hashtag: req.body.hashtag,
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
