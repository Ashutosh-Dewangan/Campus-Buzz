const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

if (currentUser.role !== "Student") {
    alert("Only students can raise complaints");
    window.location.href = "complaints.html";
}

function apiHeaders() {
    return {
        "Content-Type": "application/json",
        "x-user-role":  currentUser.role,
        "x-user-email": currentUser.email
    };
}

if (currentUser.role !== "Student") {
    alert("Only students can raise complaints");
    window.location.href = "complaints.html";
}

document.getElementById("complaintForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const newComplaint = {
        title: document.getElementById("title").value,
        text: document.getElementById("description").value,
        // FIX: location field now exists in the HTML (was missing before, causing JS error)
        location: document.getElementById("location")?.value || "",
        status: "Pending",
        owner: currentUser.email
    };

    try {
        const response = await fetch(`${API_BASE}/api/complaints`, {
            method: "POST",
            headers: apiHeaders(),
            body: JSON.stringify(newComplaint)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Save this complaint's ID so complaints.js can show "Mark Resolved" button
        // (needed because server strips owner field for anonymous mode)
        const myIds = JSON.parse(sessionStorage.getItem("myComplaintIds") || "[]");
        if (data.complaint?.id) myIds.push(data.complaint.id);
        sessionStorage.setItem("myComplaintIds", JSON.stringify(myIds));

        alert("Complaint submitted successfully!");
        window.location.href = "complaints.html";

    } catch (error) {
        console.error("Error submitting complaint:", error);
        alert("Unable to save complaint: " + error.message);
    }
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
