const express = require("express");
const router = express.Router();
const { posts, nextId } = require("../data");
// GET all posts (optionally filtered by hashtag)
// e.g. GET /api/posts?hashtag=%23foodsplit
router.get("/", (req, res) => {
    const { hashtag } = req.query;
    if (hashtag && hashtag !== "all") {
        return res.json(posts.filter(p => p.hashtag === hashtag));
    }
    res.json(posts);
});
// POST — create a new post (any logged-in user)
router.post("/", (req, res) => {
    const { user, title, content, image, hashtag, owner, expiry } = req.body;
    if (!user || !title || !content || !hashtag) {
        return res.status(400).json({
            success: false,
            error: "user, title, content and hashtag are all required."
        });
    }
    const newPost = {
        id: nextId.posts++,
        user,
        title,
        content,
        image: image || "",
        hashtag,
        owner,
        expiry: expiry || null,
        createdAt: new Date().toISOString()
    };
    posts.unshift(newPost);  // newest first
    res.status(201).json({ success: true, post: newPost });
});
// DELETE /api/posts/:id — delete by id (only owner or admin)
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) {
        return res.status(404).json({ success: false, error: "Post not found." });
    }
    const callerEmail = req.headers["x-user-email"];
    const callerRole  = req.headers["x-user-role"];
    if (callerRole !== "Admin" && posts[idx].owner !== callerEmail) {
        return res.status(403).json({ success: false, error: "You can only delete your own posts." });
    }
    posts.splice(idx, 1);
    res.json({ success: true, message: "Post deleted." });
});
module.exports = router;
