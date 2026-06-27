const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
// UI setup
document.getElementById("userRole").innerText = "Logged in as: " + currentUser.role;
// Show post form only for Club member and Admin
if (currentUser.role === "Club member" || currentUser.role === "Admin") {
    document.getElementById("addPostSection").style.display = "block";
}
function apiHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-role":  currentUser.role,
        "x-user-email": currentUser.email
    };
}
// ── Load Club Posts ───────────────────────────────────────────────────────────
async function loadClubPosts() {
    try {
        const res = await fetch(`${API_BASE}/api/club-posts`, { headers: apiHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const posts = await res.json();
        renderClubPosts(posts);
    } catch (err) {
        console.error(err);
        document.getElementById("clubPostContainer").innerHTML =
            `<p style="color:var(--danger-color)">Could not load club announcements.</p>`;
    }
}
// ── Render Club Posts ─────────────────────────────────────────────────────────
function renderClubPosts(posts) {
    const container = document.getElementById("clubPostContainer");
    container.innerHTML = "";
    if (posts.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem">
            No club announcements yet.
        </p>`;
        return;
    }
    posts.forEach(post => {
        const canDelete = currentUser.role === "Admin" || currentUser.email === post.authorEmail;
        const formBtn = post.formUrl
            ? `<a href="${escapeHtml(post.formUrl)}" target="_blank" rel="noopener" class="form-embed-link">
                 📝 Fill Form
               </a>`
            : "";
        const eventBadge = post.linkedEventId
            ? `<a href="events.html" class="event-link-badge">📅 Linked to Event #${post.linkedEventId}</a>`
            : "";
        const card = document.createElement("div");
        card.className = "club-card";
        card.id = `club-post-${post.id}`;
        card.innerHTML = `
            <div class="club-card-header">
                <div>
                    <h3>${escapeHtml(post.title)}</h3>
                    <span class="club-badge">🏛️ ${escapeHtml(post.author)}</span>
                </div>
                ${canDelete ? `<button class="danger" onclick="deleteClubPost(${post.id})"
                    style="padding:0.3rem 0.75rem;font-size:0.8rem">Delete</button>` : ""}
            </div>
            <p>${escapeHtml(post.content)}</p>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
                ${formBtn}
                ${eventBadge}
            </div>
            <div class="meta">Posted on ${new Date(post.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
            })}</div>
        `;
        container.appendChild(card);
    });
}
// ── Submit New Club Post ──────────────────────────────────────────────────────
async function submitClubPost() {
    const title       = document.getElementById("postTitle").value.trim();
    const content     = document.getElementById("postContent").value.trim();
    const formUrl     = document.getElementById("postFormUrl").value.trim();
    const author      = document.getElementById("postAuthor").value.trim();
    const linkedEvent = document.getElementById("postLinkedEvent").value.trim();
    if (!title || !content || !author) {
        alert("Title, content and club name are required.");
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/club-posts`, {
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify({
                title, content, formUrl,
                author,
                authorEmail: currentUser.email,
                linkedEventId: linkedEvent ? parseInt(linkedEvent) : null
            })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        // Clear form
        ["postTitle","postContent","postFormUrl","postAuthor","postLinkedEvent"]
            .forEach(id => { document.getElementById(id).value = ""; });
        loadClubPosts();
    } catch (err) {
        alert("Could not post: " + err.message);
    }
}
// ── Delete a Club Post ────────────────────────────────────────────────────────
async function deleteClubPost(postId) {
    if (!confirm("Delete this announcement?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/club-posts/${postId}`, {
            method: "DELETE",
            headers: apiHeaders()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        document.getElementById(`club-post-${postId}`)?.remove();
    } catch (err) {
        alert("Could not delete: " + err.message);
    }
}
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
loadClubPosts();
