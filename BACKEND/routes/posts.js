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

// DELETE a post by index
router.delete("/:index", (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < posts.length) {
        posts.splice(index, 1);
        res.json({ success: true, message: "Post deleted successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid index" });
    }
});

// Extend post expiry by 30 minutes (1800000 ms)
router.post("/:index/extend", (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < posts.length) {
        let post = posts[index];
        if (post.expiry) {
            // Extend by 30 minutes
            post.expiry = Number(post.expiry) + 1800000;
            res.json({ success: true, message: "Post expiry extended successfully", post });
        } else {
            res.status(400).json({ success: false, message: "Post does not have an expiry timer" });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid index" });
    }
});

module.exports = router;
