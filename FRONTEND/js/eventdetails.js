const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    let selectedEvent = null;

    try {
        selectedEvent = JSON.parse(localStorage.getItem("selectedEvent"));
    } catch (error) {
        selectedEvent = null;
    }

    if (!selectedEvent) {
        alert("No event selected.");
        window.location.href = "events.html";
    } else {
        CampusBuzz.setText("eventTitle", selectedEvent.title || "Event Details");
        CampusBuzz.setText("eventDate", selectedEvent.date || "Not specified");
        CampusBuzz.setText("eventTime", selectedEvent.time || "Not specified");
        CampusBuzz.setText("eventVenue", selectedEvent.venue || "Not specified");
        CampusBuzz.setText("eventClub", selectedEvent.club || "Not specified");
        CampusBuzz.setText("eventDescription", selectedEvent.description || "No description available.");
        CampusBuzz.setText("eventRegistration", selectedEvent.registration || "At venue");
    }
}
