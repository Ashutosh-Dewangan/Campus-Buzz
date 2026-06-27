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
        location: document.getElementById("location").value,
        status: "Pending",
        owner: currentUser.email
    };

    try {
        const response = await fetch("/api/complaints", {
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
