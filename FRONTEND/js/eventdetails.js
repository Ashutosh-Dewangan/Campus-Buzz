let selectedEvent =
    JSON.parse(localStorage.getItem("selectedEvent"));
if (!selectedEvent) {
    alert("No event on this date.");
    window.location.href = "events.html";
}
else {
    document.getElementById("eventTitle").innerText =
        selectedEvent.title;
    document.getElementById("eventDate").innerText =
        "Date: " + selectedEvent.date;
    document.getElementById("eventTime").innerText =
        "Time: " + selectedEvent.time;
    document.getElementById("eventVenue").innerText =
        "Venue: " + selectedEvent.venue;
    document.getElementById("eventDescription").innerText =
        "Description: " + selectedEvent.description;
    document.getElementById("eventRegistration").innerText =
        "Registration: " + (selectedEvent.registration || "At venue");
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
