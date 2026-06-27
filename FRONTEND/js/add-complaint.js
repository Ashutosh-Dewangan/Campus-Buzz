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
        location: document.getElementById("category").value,
        status: "Pending",
        owner: currentUser.email
    };

    const response = await fetch("/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint)
    });

    if (!response.ok) {
        alert("Unable to save complaint. Please try again.");
        return;
    }

    alert("Complaint submitted successfully!");
    window.location.href = "complaints.html";
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
