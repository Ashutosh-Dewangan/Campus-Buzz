let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

if (currentUser.role === "Student") {
    alert("Only Club member/Admin can create events");
    window.location.href = "events.html";
}

document.getElementById("eventForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const dateValue = document.getElementById("date").value;
    const eventDate = new Date(dateValue + "T00:00:00");
    const newEvent = {
        day: eventDate.getDate(),
        title: document.getElementById("title").value,
        club: document.getElementById("club").value,
        date: eventDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }),
        time: document.getElementById("time").value,
        venue: document.getElementById("venue").value,
        description: document.getElementById("description").value,
        registration: document.getElementById("registration").value
    };

    const response = await fetch("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
    });

    if (!response.ok) {
        alert("Unable to save event. Please try again.");
        return;
    }

    alert("Event added successfully!");
    window.location.href = "events.html";
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
