const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
// Set greeting
document.getElementById("userRole").innerText = "Logged in as: " + currentUser.role;
const greetEl = document.getElementById("greetName");
if (greetEl) greetEl.innerText = currentUser.name || currentUser.email;
// Build request headers (role sent with every API call for server-side gating)
function apiHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-role":  currentUser.role,
        "x-user-email": currentUser.email
    };
}
let posts = [];
let activeHashtag = "all";
// ── Load Posts ────────────────────────────────────────────────────────────────
async function loadPosts(hashtag = "all") {
    activeHashtag = hashtag;
    try {
        const url = hashtag === "all"
            ? `${API_BASE}/api/posts`
            : `${API_BASE}/api/posts?hashtag=${encodeURIComponent(hashtag)}`;
        const response = await fetch(url, { headers: apiHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        posts = await response.json();
        displayPosts();
        updateFilterButtons(hashtag);
    } catch (error) {
        console.error("Error loading posts:", error);
        document.getElementById("postContainer").innerHTML =
            `<p style="color:var(--danger-color)">Could not load posts. Is the server running?</p>`;
    }
}
// ── Display Posts ─────────────────────────────────────────────────────────────
function displayPosts() {
    const container = document.getElementById("postContainer");
    container.innerHTML = "";
    if (posts.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem">
            No posts found${activeHashtag !== "all" ? " for " + activeHashtag : ""}. Be the first to post!
        </p>`;
        return;
    }
    posts.forEach((post) => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.id = `post-card-${post.id}`;
        // Can user chat? Only #foodsplit, #cabsplit, #resell get chat rooms
        const chatHashtags = ["#foodsplit", "#cabsplit", "#resell"];
        const canChat = chatHashtags.includes(post.hashtag);
        // Active chat indicator
        const msgCount = parseInt(localStorage.getItem("chat_msg_count_" + post.id) || "0");
        const activeChatBadge = (canChat && msgCount > 0)
            ? `<span class="badge-active-chat" style="display:inline-block;background-color:#10b981;color:white;padding:0.2rem 0.5rem;border-radius:12px;font-size:0.8rem;margin-left:0.5rem;animation:timer-pulse-warn 1.5s infinite;">💬 Active Chat (${msgCount})</span>`
            : "";
        // Can user extend? Only if post has expiry and user is owner
        const canExtend = post.expiry && post.owner === currentUser.email;
        // Can user delete?
        const canDelete = post.owner === currentUser.email || currentUser.role === "Admin";
        // Expiry display
        const expiryHtml = post.expiry
            ? `<div id="timer-${post.id}" class="timer">⏱ Loading timer...</div>`
            : "";
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
                <div>
                    <h3>${escapeHtml(post.user)}</h3>
                    <h4>${escapeHtml(post.title)}</h4>
                </div>
                <div>
                    <span class="hashtag-tag">${escapeHtml(post.hashtag)}</span>
                    ${activeChatBadge}
                </div>
            </div>
            <p>${escapeHtml(post.content)}</p>
            ${post.image ? `<img src="${post.image.startsWith('/') ? API_BASE + escapeHtml(post.image) : escapeHtml(post.image)}" alt="Post image" style="max-width:100%;border-radius:6px;margin:0.5rem 0">` : ""}
            ${expiryHtml}
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.75rem">
                ${canChat ? `<button class="secondary" onclick="openChat('${post.id}', '${escapeHtml(post.hashtag)}', '${escapeHtml(post.owner || '')}')">💬 Open Chat</button>` : ""}
                ${canExtend ? `<button class="secondary" onclick="extendPost('${post.id}')">Extend 30m</button>` : ""}
                ${canDelete ? `<button class="danger" onclick="deletePost('${post.id}')">Delete</button>` : ""}
            </div>
        `;
        container.appendChild(card);
    });
}
// ── Expiry Timers ─────────────────────────────────────────────────────────────
function updateTimers() {
    const now = Date.now();
    posts.forEach(post => {
        if (!post.expiry) return;
        const remaining = Math.floor((post.expiry - now) / 1000);
        const el = document.getElementById(`timer-${post.id}`);
        if (!el) return;
        if (remaining > 0) {
            const h = Math.floor(remaining / 3600);
            const m = Math.floor((remaining % 3600) / 60);
            const s = remaining % 60;
            el.innerText = h > 0
                ? `⏱ Expires in: ${h}h ${m}m ${s}s`
                : m > 0 ? `⏱ Expires in: ${m}m ${s}s` : `⏱ Expires in: ${s}s`;
            if (remaining < 300) {
                el.classList.add("timer-warning");
            } else {
                el.classList.remove("timer-warning");
            }
        } else {
            // Expired on client side — remove card optimistically
            const card = document.getElementById(`post-card-${post.id}`);
            if (card) card.remove();
        }
    });
}
// ── Add a Post ────────────────────────────────────────────────────────────────
async function addPost() {
    const username = document.getElementById("username").value.trim();
    const title    = document.getElementById("postTitle").value.trim();
    const content  = document.getElementById("content").value.trim();
    const image    = document.getElementById("imageUrl").value.trim();
    const hashtag  = document.getElementById("hashtag").value;
    const expiryMins = document.getElementById("expiryMins")?.value;
    if (!username || !title || !content || !hashtag) {
        alert("Please fill in all required fields.");
        return;
    }
    // Auto-set expiry for time-sensitive hashtags
    let expiry = null;
    if (hashtag === "#foodsplit" || hashtag === "#cabsplit") {
        const mins = parseInt(expiryMins) || 15;
        expiry = Date.now() + mins * 60 * 1000;
    }
    try {
        const response = await fetch(`${API_BASE}/api/posts`, {
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify({ user: username, title, content, image, hashtag, owner: currentUser.email, expiry })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP ${response.status}`);
        }
        // Clear form
        ["username","postTitle","content","imageUrl"].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = "";
        });
        document.getElementById("hashtag").value = "";
        // Reload posts (respect active filter)
        loadPosts(activeHashtag);
    } catch (error) {
        console.error("Error adding post:", error);
        alert("Could not add post: " + error.message);
    }
}
// ── Delete a Post ─────────────────────────────────────────────────────────────
async function deletePost(postId) {
    if (!confirm("Delete this post?")) return;
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}`, {
            method: "DELETE",
            headers: apiHeaders()
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP ${response.status}`);
        }
        document.getElementById(`post-card-${postId}`)?.remove();
        posts = posts.filter(p => p.id !== postId);
    } catch (error) {
        alert("Could not delete: " + error.message);
    }
}

// ── Extend a Post ─────────────────────────────────────────────────────────────
async function extendPost(postId) {
    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}/extend`, {
            method: "POST",
            headers: apiHeaders()
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP ${response.status}`);
        }
        const data = await response.json();
        // Update local post expiry
        const post = posts.find(p => p.id === parseInt(postId));
        if (post) {
            post.expiry = data.post.expiry;
        }
        alert("Post timer extended by 30 minutes!");
    } catch (error) {
        console.error("Error extending post:", error);
        alert("Unable to extend post: " + error.message);
    }
}
// ── Open Chat Room ────────────────────────────────────────────────────────────
// Stores post info so chat.js knows which Socket.io room to join
function openChat(postId, hashtag, ownerEmail) {
    localStorage.setItem("chatPostId",    String(postId));
    localStorage.setItem("chatPostOwner", ownerEmail);
    localStorage.setItem("chatTopic",     hashtag);
    window.location.href = "chat.html";
}
// ── Hashtag Filter Buttons ────────────────────────────────────────────────────
function filterByHashtag(hashtag) {
    loadPosts(hashtag);
}
function updateFilterButtons(activeTag) {
    document.querySelectorAll(".hashtags button").forEach(btn => {
        const tag = btn.dataset.tag;
        if (tag === activeTag) {
            btn.style.backgroundColor = "var(--primary-color)";
            btn.style.color = "#020617";
        } else {
            btn.style.backgroundColor = "";
            btn.style.color = "";
        }
    });
}
// ── Show expiry input only for time-sensitive hashtags ────────────────────────
document.getElementById("hashtag")?.addEventListener("change", function() {
    const expiryGroup = document.getElementById("expiryGroup");
    if (!expiryGroup) return;
    const timeSensitive = ["#foodsplit", "#cabsplit"].includes(this.value);
    expiryGroup.style.display = timeSensitive ? "block" : "none";
});
// ── Escape HTML (XSS protection) ──────────────────────────────────────────────
function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
// ── Socket.io: listen for background job expiry events ───────────────────────
// When the server's background job expires posts, remove those cards from the feed
const socket = io();
socket.on("posts-expired", ({ expiredIds }) => {
    expiredIds.forEach(id => {
        const card = document.getElementById(`post-card-${id}`);
        if (card) {
            card.style.transition = "opacity 0.5s";
            card.style.opacity = "0";
            setTimeout(() => card.remove(), 500);
        }
        posts = posts.filter(p => p.id !== id);
    });
});
// ── Init ──────────────────────────────────────────────────────────────────────
loadPosts();
setInterval(updateTimers, 1000);
