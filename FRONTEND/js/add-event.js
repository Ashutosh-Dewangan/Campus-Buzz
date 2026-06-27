const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    const canCreateEvents = currentUser.role === "Club Member" || currentUser.role === "Admin";

    if (!canCreateEvents) {
        alert("Only club members and admins can create events.");
        window.location.href = "events.html";
    } else {
        const eventForm = document.getElementById("eventForm");

        eventForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const dateValue = document.getElementById("date").value;
            const eventDate = new Date(dateValue + "T00:00:00");

            if (Number.isNaN(eventDate.getTime())) {
                alert("Please choose a valid event date.");
                return;
            }

            if (eventDate.getFullYear() !== 2026 || eventDate.getMonth() !== 6) {
                alert("Please choose a date in July 2026 so it appears on the calendar.");
                return;
            }

            const submitButton = eventForm.querySelector("button[type='submit']");
            const newEvent = {
                day: eventDate.getDate(),
                title: document.getElementById("title").value.trim(),
                club: document.getElementById("club").value.trim(),
                date: eventDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }),
                time: document.getElementById("time").value,
                venue: document.getElementById("venue").value.trim(),
                description: document.getElementById("description").value.trim(),
                registration: document.getElementById("registration").value.trim()
            };

            if (!newEvent.title || !newEvent.club || !newEvent.time || !newEvent.venue || !newEvent.description) {
                alert("Please fill all required fields.");
                return;
            }

            submitButton.disabled = true;

            try {
                await CampusBuzz.api("/events", {
                    method: "POST",
                    body: JSON.stringify(newEvent)
                });

                window.location.href = "events.html";
            } catch (error) {
                console.error("Error adding event:", error);
                alert(error.message || "Unable to save event. Please try again.");
                submitButton.disabled = false;
            }
        });
    }
}
