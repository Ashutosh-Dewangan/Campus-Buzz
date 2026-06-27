console.log("posts.js loaded");
const express = require("express");
const router = express.Router();

let posts = [
    {
      user: "Ananya",
      title: "",
      content: "Order food with us. Live from Hostel Indrawati. Hurry up!!",
      image: "",
      hashtag: "#foodsplit",
      owner: "Ananya Pathak"
    },
    {
        user: "Rohit",  
        title: "",
        content: "Need a cab to the city. Anyone going?",
        image: "",
        hashtag: "#cabsplit",
        owner: "Rohit Sharma"
    },
    {
        user: "Harshita",
        title: "",
        content: "Selling my old Engineering Graphics Equipment. DM for details.",
        hashtag: "#resell",
        owner: "Harshita Gupta"
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
