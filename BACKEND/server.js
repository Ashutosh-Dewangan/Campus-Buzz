const express = require("express");
const http = require("http");           // needed to wrap express for socket.io
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const { posts, chatRooms } = require("./data");
const app = express();
const server = http.createServer(app);  // wrap express in http server
// Attach Socket.io to the HTTP server
const io = new Server(server, {
    cors: { origin: "*" }
});
// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// ── API Routes (BEFORE static files) ─────────────────────────────────────────
const postRoutes      = require("./routes/posts");
const eventRoutes     = require("./routes/events");
const complaintRoutes = require("./routes/complaints");
const clubPostRoutes  = require("./routes/club-posts");
app.use("/api/posts",       postRoutes);
app.use("/api/events",      eventRoutes);
app.use("/api/complaints",  complaintRoutes);
app.use("/api/club-posts",  clubPostRoutes);
// ── Static Files (AFTER API routes) ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../FRONTEND")));
// ── Socket.io — Real-Time Chat Rooms ─────────────────────────────────────────
io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    // Client wants to join a chat room for a specific post
    socket.on("join-room", ({ postId, username }) => {
        const roomId = `post-${postId}`;
        // Init room if it doesn't exist
        if (!chatRooms[postId]) {
            chatRooms[postId] = { open: true, messages: [] };
        }
        const room = chatRooms[postId];
        if (!room.open) {
            // Room closed by poster — reject with notification
            socket.emit("room-closed", { message: "This chat room has been closed by the poster." });
            return;
        }
        socket.join(roomId);
        socket.data.postId = postId;
        socket.data.username = username;
        console.log(`[Socket] ${username} joined room ${roomId}`);
        // Send message history to the newly joined client
        socket.emit("message-history", room.messages);
        // Notify others in the room
        socket.to(roomId).emit("user-joined", { username });
    });
    // Client sends a message
    socket.on("send-message", ({ postId, username, text }) => {
        const roomId = `post-${postId}`;
        const room = chatRooms[postId];
        if (!room || !room.open) {
            socket.emit("room-closed", { message: "This room is no longer open." });
            return;
        }
        const message = {
            sender: username,
            text,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        };
        room.messages.push(message);
        // Broadcast to everyone in the room (including sender for confirmation)
        io.to(roomId).emit("new-message", message);
    });
    // Poster closes the room
    socket.on("close-room", ({ postId }) => {
        const roomId = `post-${postId}`;
        if (chatRooms[postId]) {
            chatRooms[postId].open = false;
        }
        // Tell everyone in the room it's closed
        io.to(roomId).emit("room-closed", { message: "The poster has closed this chat room." });
        console.log(`[Socket] Room ${roomId} closed by poster`);
    });
    // Client leaves room
    socket.on("leave-room", ({ postId }) => {
        socket.leave(`post-${postId}`);
    });
    socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});
// ── Background Job: Post Expiry ───────────────────────────────────────────────
// Runs every 60 seconds. Scans posts for expired ones and removes them.
// This is intentionally a background job — NOT done inline with API requests.
// After deletion, emits a socket event so live feed pages update instantly.
setInterval(() => {
    const now = Date.now();
    let expiredIds = [];
    // Scan backwards so splice doesn't shift indices mid-loop
    for (let i = posts.length - 1; i >= 0; i--) {
        if (posts[i].expiry && posts[i].expiry < now) {
            console.log(`[Expiry] Auto-deleting post id=${posts[i].id} "${posts[i].title}"`);
            expiredIds.push(posts[i].id);
            posts.splice(i, 1);
        }
    }
    // If any posts were deleted, broadcast to all connected clients
    // so their feed updates without needing a refresh
    if (expiredIds.length > 0) {
        io.emit("posts-expired", { expiredIds });
    }
}, 60000); // every 60 seconds
// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Campus Buzz running on http://localhost:${PORT}`);
    console.log(`   Socket.io real-time chat: enabled`);
    console.log(`   Post expiry background job: running every 60s`);
});
