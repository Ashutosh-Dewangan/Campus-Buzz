let chatTopic = localStorage.getItem("chatTopic");
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
}
document.getElementById("chatTitle").innerText =
    "Chat Room: " + chatTopic;
let messages = [];

// FIX: escape HTML to prevent XSS attacks from user-typed messages
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sendMessage() {
    let message = document.getElementById("message").value.trim();
    if (!message) {
        alert("Enter a message");
        return;
    }
    const senderName = currentUser?.name || currentUser?.email || "You";
    messages.push({ sender: senderName, text: message });
    let chatBox = document.getElementById("chatBox");
    // FIX: use escapeHtml to prevent XSS; also show sender name
    chatBox.innerHTML += `<p><strong>${escapeHtml(senderName)}:</strong> ${escapeHtml(message)}</p>`;
    document.getElementById("message").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}