const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

let selectedEvent = JSON.parse(localStorage.getItem("selectedEvent"));
if (!selectedEvent) {
    alert("No event selected.");
    window.location.href = "events.html";
}

// Function to fetch latest event state from server and render it
async function loadEventDetails() {
    try {
        const response = await fetch(`${API_BASE}/api/events`);
        if (!response.ok) throw new Error("Failed to load events");
        const events = await response.json();
        const updated = events.find(e => e.id === selectedEvent.id);
        if (updated) {
            selectedEvent = updated;
            localStorage.setItem("selectedEvent", JSON.stringify(updated));
        }
        renderEvent();
    } catch (error) {
        console.error("Error updating event stats:", error);
        renderEvent(); // fallback to local storage
    }
}

function renderEvent() {
    document.getElementById("eventTitle").innerText = selectedEvent.title;
    document.getElementById("eventDate").innerText = "Date: " + selectedEvent.date;
    document.getElementById("eventTime").innerText = "Time: " + selectedEvent.time;
    document.getElementById("eventVenue").innerText = "Venue: " + selectedEvent.venue;
    document.getElementById("eventDescription").innerText = "Description: " + (selectedEvent.description || "No description");
    document.getElementById("eventRegistration").innerText = "Registration: " + (selectedEvent.registration || "At venue");
    
    // RSVP counts
    const goingCount = selectedEvent.rsvps?.going?.length || 0;
    const interestedCount = selectedEvent.rsvps?.interested?.length || 0;
    document.getElementById("eventRsvps").innerText = `RSVPs — Going: ${goingCount} | Interested: ${interestedCount}`;
    
    // Highlights selected rsvp status
    const isGoing = selectedEvent.rsvps?.going?.includes(currentUser.email);
    const isInterested = selectedEvent.rsvps?.interested?.includes(currentUser.email);
    
    document.getElementById("btnGoing").style.border = isGoing ? "2px solid white" : "";
    document.getElementById("btnGoing").style.fontWeight = isGoing ? "bold" : "";
    document.getElementById("btnInterested").style.border = isInterested ? "2px solid white" : "";
    document.getElementById("btnInterested").style.fontWeight = isInterested ? "bold" : "";
    
    // Google Calendar link
    // Format: yyyymmddThhmmss
    // Strip dashes from date e.g. "2026-07-07" to "20260707"
    const cleanDate = String(selectedEvent.date || "").replace(/-/g, "");
    // Strip colons from time e.g. "09:00" to "090000"
    const cleanTime = String(selectedEvent.time || "").replace(/:/g, "") + "00";
    
    if (cleanDate && cleanTime) {
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.title)}&dates=${cleanDate}T${cleanTime}/${cleanDate}T${cleanTime}&details=${encodeURIComponent(selectedEvent.description || '')}&location=${encodeURIComponent(selectedEvent.venue)}`;
        document.getElementById("btnGoogleCalendar").href = calendarUrl;
    }
}

async function submitRsvp(status) {
    try {
        const response = await fetch(`${API_BASE}/api/events/${selectedEvent.id}/rsvp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-role": currentUser.role,
                "x-user-email": currentUser.email
            },
            body: JSON.stringify({ email: currentUser.email, status })
        });
        if (!response.ok) throw new Error("Failed to submit RSVP");
        const data = await response.json();
        selectedEvent = data.event;
        localStorage.setItem("selectedEvent", JSON.stringify(selectedEvent));
        renderEvent();
    } catch (error) {
        alert("Could not update RSVP: " + error.message);
    }
}

loadEventDetails();

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
