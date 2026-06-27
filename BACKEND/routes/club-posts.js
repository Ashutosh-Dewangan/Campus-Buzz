const express = require("express");
const router = express.Router();
const { clubPosts, nextId } = require("../data");
const roleGate = require("../middleware/roleGate");
// GET all club posts (all logged-in users can read)
router.get("/", (req, res) => {
    res.json(clubPosts);
});
// POST — create club post (Club member or Admin ONLY — server enforced)
router.post("/", roleGate(["Club member", "Admin"]), (req, res) => {
    const { title, content, formUrl, author, authorEmail, linkedEventId } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, error: "title and content are required." });
    }
    const newPost = {
        id: nextId.clubPosts++,
        title,
        content,
        formUrl: formUrl || "",        // optional embedded Google Form URL
        author: author || "",
        authorEmail: authorEmail || "",
        linkedEventId: linkedEventId || null,  // optional calendar link
        createdAt: new Date().toISOString()
    };
    clubPosts.unshift(newPost);
    res.status(201).json({ success: true, post: newPost });
});
// DELETE — Club member (own) or Admin
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const idx = clubPosts.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Post not found." });
    const callerEmail = req.headers["x-user-email"];
    const callerRole  = req.headers["x-user-role"];
    if (callerRole !== "Admin" && clubPosts[idx].authorEmail !== callerEmail) {
        return res.status(403).json({ success: false, error: "You can only delete your own posts." });
    }
    clubPosts.splice(idx, 1);
    res.json({ success: true, message: "Club post deleted." });
});
module.exports = router;
