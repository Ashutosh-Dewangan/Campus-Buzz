const express = require("express");

const router = express.Router();

let nextPostId = 3;

let posts = [
    {
        id: 1,
        user: "Rahul Dubey",
        title: "Friendly match",
        content: "Football match at 6 PM! Do not miss out.",
        image: "/assets/images/football.jpg",
        hashtag: "#FootballIsLife",
        owner: "student1@nitrr.ac.in",
        expiry: null
    },
    {
        id: 2,
        user: "Aman Sharma",
        title: "Hackathon announcement",
        content: "Hackathon registrations are open.",
        image: "/assets/images/coding.jpg",
        hashtag: "#Codingggg",
        owner: "club@nitrr.ac.in",
        expiry: null
    }
];

function cleanText(value) {
    return String(value || "").trim();
}

function removeExpiredPosts() {
    const now = Date.now();
    posts = posts.filter((post) => !post.expiry || Number(post.expiry) > now);
}

router.get("/", (req, res) => {
    removeExpiredPosts();
    res.json(posts);
});

router.post("/", (req, res) => {
    const user = cleanText(req.body.user);
    const title = cleanText(req.body.title);
    const content = cleanText(req.body.content);
    const hashtag = cleanText(req.body.hashtag);
    const owner = cleanText(req.body.owner);
    const image = cleanText(req.body.image);
    const expiry = req.body.expiry ? Number(req.body.expiry) : null;

    if (!user || !title || !content || !hashtag || !owner) {
        return res.status(400).json({
            success: false,
            message: "User, title, content, hashtag, and owner are required."
        });
    }

    if (expiry && Number.isNaN(expiry)) {
        return res.status(400).json({
            success: false,
            message: "Expiry must be a valid timestamp."
        });
    }

    const newPost = {
        id: nextPostId++,
        user,
        title,
        content,
        image,
        hashtag,
        owner,
        expiry
    };

    posts.unshift(newPost);

    return res.status(201).json({
        success: true,
        message: "Post added successfully.",
        post: newPost
    });
});

router.delete("/:id", (req, res) => {
    const postId = Number(req.params.id);
    const postIndex = posts.findIndex((post) => post.id === postId);

    if (postIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Post not found."
        });
    }

    const deletedPost = posts.splice(postIndex, 1)[0];

    return res.json({
        success: true,
        message: "Post deleted successfully.",
        post: deletedPost
    });
});

module.exports = router;
