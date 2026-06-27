const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
}
// Post info stored by feed.js before navigating here
const postId    = localStorage.getItem("chatPostId");
const postOwner = localStorage.getItem("chatPostOwner");   // poster's email
const chatTopic = localStorage.getItem("chatTopic");       // e.g. #foodsplit
if (!postId) {
    alert("No chat room specified. Redirecting to feed.");
    window.location.href = "feed.html";
}
document.getElementById("chatTitle").innerText = `💬 ${chatTopic} Chat Room`;
// ── Connect to Socket.io server ───────────────────────────────────────────────
const socket = io();  // connects to same host/port automatically
// Join this post's room
socket.emit("join-room", {
    postId,
    username: currentUser.name || currentUser.email
});
// ── Receive message history on join ──────────────────────────────────────────
socket.on("message-history", (messages) => {
    clearChat();
    localStorage.setItem("chat_msg_count_" + postId, messages.length);
    if (messages.length === 0) {
        addSystemMessage("No messages yet. Be the first to say something!");
    } else {
        messages.forEach(msg => addMessage(msg, false));
    }
});
// ── Receive new messages in real-time ────────────────────────────────────────
socket.on("new-message", (message) => {
    const isOwn = message.sender === (currentUser.name || currentUser.email);
    addMessage(message, isOwn);
    const currentCount = parseInt(localStorage.getItem("chat_msg_count_" + postId) || "0");
    localStorage.setItem("chat_msg_count_" + postId, currentCount + 1);
});
// ── Someone else joined ───────────────────────────────────────────────────────
socket.on("user-joined", ({ username }) => {
    addSystemMessage(`${username} joined the room`);
});
// ── Room was closed (by poster or background job) ────────────────────────────
socket.on("room-closed", ({ message }) => {
    addSystemMessage(`🔒 ${message}`);
    disableChat();
});
// ── Background job deleted this post ─────────────────────────────────────────
socket.on("posts-expired", ({ expiredIds }) => {
    if (expiredIds.includes(parseInt(postId))) {
        addSystemMessage("⏰ This post has expired and been removed.");
        disableChat();
    }
});
// ── Show "Close Room" button only to the poster ───────────────────────────────
if (currentUser.email === postOwner) {
    document.getElementById("closeRoomBtn").style.display = "inline-block";
}
// ── Functions ─────────────────────────────────────────────────────────────────
function sendMessage() {
    const input = document.getElementById("messageInput");
    const text  = input.value.trim();
    if (!text) return;
    socket.emit("send-message", {
        postId,
        username: currentUser.name || currentUser.email,
        text
    });
    input.value = "";
}
function closeRoom() {
    if (!confirm("Close this room? No one will be able to send messages after this.")) return;
    socket.emit("close-room", { postId });
}
function addMessage(msg, isOwn) {
    const chatBox = document.getElementById("chatBox");
    const bubble  = document.createElement("div");
    bubble.className = `msg-bubble ${isOwn ? "mine" : "theirs"}`;
    bubble.innerHTML = `
        <div class="sender">${escapeHtml(msg.sender)}</div>
        <div>${escapeHtml(msg.text)}</div>
        <div class="time">${msg.time || ""}</div>
    `;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function addSystemMessage(text) {
    const chatBox = document.getElementById("chatBox");
    const el = document.createElement("div");
    el.className = "msg-bubble system";
    el.textContent = text;
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function clearChat() {
    document.getElementById("chatBox").innerHTML = "";
}
function disableChat() {
    document.getElementById("messageInput").disabled = true;
    document.getElementById("messageInput").placeholder = "Room is closed.";
    document.querySelector(".chat-input-bar button").disabled = true;
    document.getElementById("closeRoomBtn").style.display = "none";
    document.getElementById("roomStatus").textContent = "🔴 Closed";
    document.getElementById("roomStatus").className = "room-status closed";
    document.getElementById("roomClosedBanner").style.display = "block";
}
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function logout() {
    socket.emit("leave-room", { postId });
    socket.disconnect();
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}