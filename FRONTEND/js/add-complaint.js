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

document.getElementById("complaintForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const newComplaint = {
        title: document.getElementById("title").value,
        text: document.getElementById("description").value,
        // Commented out the error-causing line below because there is no "location" element in add-complaint.html:
        // location: document.getElementById("location").value,
        location: "", // Fallback empty string
        status: "Pending",
        owner: currentUser.email
    };

    try {
        const response = await fetch(`${API_BASE}/api/complaints`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newComplaint)
        });

        if (!response.ok) {
            throw new Error(`Failed to save complaint: ${response.status}`);
        }

        alert("Complaint submitted successfully!");
        window.location.href = "complaints.html";

    } catch (error) {
        console.error("Error submitting complaint:", error);
        alert("Unable to save complaint. Please try again.");
    }
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
