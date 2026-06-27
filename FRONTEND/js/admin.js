const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
// Guard: only Admin can access this page
if (!currentUser) {
    alert("Please login first.");
    window.location.href = "login.html";
} else if (currentUser.role !== "Admin") {
    alert("Access denied. Admin only.");
    window.location.href = "feed.html";
}
document.getElementById("userRole").innerText = "Logged in as: " + currentUser.role;
function apiHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-role":  "Admin",              // always send Admin role
        "x-user-email": currentUser.email
    };
}
// ── Load all data on page load ────────────────────────────────────────────────
async function loadAll() {
    await Promise.all([loadComplaints(), loadPosts(), loadEvents()]);
}
// ── Complaints ────────────────────────────────────────────────────────────────
async function loadComplaints() {
    try {
        const res = await fetch(`${API_BASE}/api/complaints`, { headers: apiHeaders() });
        const complaints = await res.json();
        // Update stat
        document.getElementById("statComplaints").innerText = complaints.length;
        document.getElementById("statPending").innerText =
            complaints.filter(c => c.status === "Pending").length;
        const list = document.getElementById("complaintsList");
        list.innerHTML = "";
        if (complaints.length === 0) {
            list.innerHTML = `<p style="color:var(--text-secondary)">No complaints found.</p>`;
            return;
        }
        complaints.forEach(c => {
            const card = document.createElement("div");
            card.className = "admin-card";
            card.id = `complaint-${c.id}`;
            card.innerHTML = `
                <h4>${escapeHtml(c.title)}</h4>
                <p>${escapeHtml(c.text)}</p>
                ${c.location ? `<p>📍 <strong>Location:</strong> ${escapeHtml(c.location)}</p>` : ""}
                <!-- Admin sees real identity — hidden from everyone else via server-side stripping -->
                <p>👤 <span class="identity-tag">Filed by: ${escapeHtml(c.owner || "Unknown")}</span></p>
                <p>Status: <strong>${escapeHtml(c.status)}</strong></p>
                <div class="card-actions">
                    <select class="status-select" id="status-sel-${c.id}">
                        <option value="Pending"     ${c.status==="Pending"?"selected":""}>Pending</option>
                        <option value="In Progress" ${c.status==="In Progress"?"selected":""}>In Progress</option>
                        <option value="Resolved"    ${c.status==="Resolved"?"selected":""}>Resolved</option>
                    </select>
                    <button class="success" onclick="updateComplaint(${c.id})">Update Status</button>
                    <button class="danger"  onclick="deleteComplaint(${c.id})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("complaintsList").innerHTML =
            `<p style="color:var(--danger-color)">Failed to load complaints.</p>`;
    }
}
async function updateComplaint(id) {
    const status = document.getElementById(`status-sel-${id}`).value;
    try {
        const res = await fetch(`${API_BASE}/api/complaints/${id}`, {
            method: "PUT",
            headers: apiHeaders(),
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        alert(`Complaint #${id} status updated to: ${status}`);
        loadComplaints();
    } catch (err) { alert("Error: " + err.message); }
}
async function deleteComplaint(id) {
    if (!confirm("Delete this complaint permanently?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/complaints/${id}`, {
            method: "DELETE", headers: apiHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).error);
        document.getElementById(`complaint-${id}`)?.remove();
        loadComplaints(); // refresh stats
    } catch (err) { alert("Error: " + err.message); }
}
// ── Posts ─────────────────────────────────────────────────────────────────────
async function loadPosts() {
    try {
        const res = await fetch(`${API_BASE}/api/posts`, { headers: apiHeaders() });
        const posts = await res.json();
        document.getElementById("statPosts").innerText = posts.length;
        const list = document.getElementById("postsList");
        list.innerHTML = "";
        if (posts.length === 0) {
            list.innerHTML = `<p style="color:var(--text-secondary)">No posts found.</p>`;
            return;
        }
        posts.forEach(p => {
            const card = document.createElement("div");
            card.className = "admin-card";
            card.id = `post-admin-${p.id}`;
            card.innerHTML = `
                <h4>${escapeHtml(p.title)} <span style="font-size:0.8rem;color:var(--primary-color)">${escapeHtml(p.hashtag)}</span></h4>
                <p>${escapeHtml(p.content)}</p>
                <p>👤 <span class="identity-tag">Posted by: ${escapeHtml(p.owner || p.user)}</span></p>
                ${p.expiry ? `<p style="color:var(--warning-color);font-size:0.82rem">
                    ⏱ Expires: ${new Date(p.expiry).toLocaleString("en-IN")}
                </p>` : ""}
                <div class="card-actions">
                    <button class="danger" onclick="deletePost(${p.id})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        document.getElementById("postsList").innerHTML =
            `<p style="color:var(--danger-color)">Failed to load posts.</p>`;
    }
}
async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/posts/${id}`, {
            method: "DELETE", headers: apiHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).error);
        document.getElementById(`post-admin-${id}`)?.remove();
        document.getElementById("statPosts").innerText =
            parseInt(document.getElementById("statPosts").innerText) - 1;
    } catch (err) { alert("Error: " + err.message); }
}
// ── Events ────────────────────────────────────────────────────────────────────
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/api/events`, { headers: apiHeaders() });
        const events = await res.json();
        document.getElementById("statEvents").innerText = events.length;
        const list = document.getElementById("eventsList");
        list.innerHTML = "";
        events.forEach(ev => {
            const card = document.createElement("div");
            card.className = "admin-card";
            card.id = `event-admin-${ev.id}`;
            card.innerHTML = `
                <h4>${escapeHtml(ev.title)}</h4>
                <p>📅 ${escapeHtml(ev.date)} at ${escapeHtml(ev.time)} — ${escapeHtml(ev.venue)}</p>
                <p>🏛️ ${escapeHtml(ev.club)}</p>
                <div class="card-actions">
                    <button class="danger" onclick="deleteEvent(${ev.id})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        document.getElementById("eventsList").innerHTML =
            `<p style="color:var(--danger-color)">Failed to load events.</p>`;
    }
}
async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: "DELETE", headers: apiHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).error);
        document.getElementById(`event-admin-${id}`)?.remove();
    } catch (err) { alert("Error: " + err.message); }
}
// ── Tab Switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
    ["complaints","posts","events"].forEach(t => {
        document.getElementById(`panel-${t}`).classList.remove("active");
        document.getElementById(`tab-${t}`).classList.remove("active");
    });
    document.getElementById(`panel-${tab}`).classList.add("active");
    document.getElementById(`tab-${tab}`).classList.add("active");
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
loadAll();
