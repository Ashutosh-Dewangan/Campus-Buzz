const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
document.getElementById("userRole").innerText = "Logged in as: " + currentUser.role;
function apiHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-role":  currentUser.role,
        "x-user-email": currentUser.email
    };
}
let complaints = [];
// Track which complaint IDs the current user filed (stored locally for "Mark Resolved" button)
// Since owner is stripped server-side, we use sessionStorage to remember what this user filed
let myComplaintIds = JSON.parse(sessionStorage.getItem("myComplaintIds") || "[]");
async function loadComplaints() {
    try {
        const response = await fetch(`${API_BASE}/api/complaints`, { headers: apiHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        complaints = await response.json();
        displayComplaints();
    } catch (error) {
        console.error("Error loading complaints:", error);
        document.getElementById("complaintContainer").innerHTML =
            `<p style="color:var(--danger-color)">Could not load complaints.</p>`;
    }
}
function displayComplaints() {
    const container = document.getElementById("complaintContainer");
    container.innerHTML = "";
    if (complaints.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:2rem">
            No complaints yet.
        </p>`;
        return;
    }
    complaints.forEach(function(complaint) {
        const card = document.createElement("div");
        card.className = "complaint-card";
        const statusClass = complaint.status.toLowerCase().replace(/\s+/g, "-");
        const canResolve = myComplaintIds.includes(complaint.id) && complaint.status !== "Resolved";
        card.innerHTML = `
            <h3>${escapeHtml(complaint.title)}</h3>
            <p>${escapeHtml(complaint.text)}</p>
            <p><strong>Location:</strong> ${escapeHtml(complaint.location || "Not specified")}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${escapeHtml(complaint.status)}</span></p>
            <!-- No owner shown here — server already stripped it for non-admin users -->
            ${canResolve ? `<button class="success" onclick="resolveComplaint(${complaint.id})">
                ✅ Mark as Resolved
            </button>` : ""}
        `;
        container.appendChild(card);
    });
}
async function resolveComplaint(id) {
    if (!confirm("Mark this complaint as resolved?")) return;
    try {
        const response = await fetch(`${API_BASE}/api/complaints/${id}`, {
            method: "PUT",
            headers: apiHeaders(),
            body: JSON.stringify({ status: "Resolved" })
        });
        if (!response.ok) throw new Error((await response.json()).error || "Error");
        loadComplaints();
    } catch (error) {
        alert("Could not resolve: " + error.message);
    }
}
function filterComplaints() {
    const selected = document.getElementById("statusFilter").value.trim();
    if (selected === "All") { displayComplaints(); return; }
    const container = document.getElementById("complaintContainer");
    const filtered = complaints.filter(c => c.status === selected);
    container.innerHTML = "";
    if (filtered.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary)">No complaints with status: ${selected}</p>`;
        return;
    }
    filtered.forEach(complaint => {
        const card = document.createElement("div");
        card.className = "complaint-card";
        const statusClass = complaint.status.toLowerCase().replace(/\s+/g, "-");
        card.innerHTML = `
            <h3>${escapeHtml(complaint.title)}</h3>
            <p>${escapeHtml(complaint.text)}</p>
            <p><strong>Location:</strong> ${escapeHtml(complaint.location || "Not specified")}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${escapeHtml(complaint.status)}</span></p>
        `;
        container.appendChild(card);
    });
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
loadComplaints();
