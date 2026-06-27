const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    let eventsByDay = {};

    const calendar = document.querySelector(".calendar");
    const eventList = document.getElementById("eventList");
    const searchButton = document.getElementById("searchEventBtn");
    const searchInput = document.getElementById("eventSearch");
    const searchResult = document.getElementById("searchResult");
    const addEventLink = document.getElementById("addEventLink");

    if (currentUser.role === "Student") {
        addEventLink.classList.add("hidden");
    }

    calendar.addEventListener("click", handleCalendarClick);
    searchButton.addEventListener("click", searchEvent);
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchEvent();
        }
    });

    loadEvents();

    async function loadEvents() {
        try {
            const data = await CampusBuzz.api("/events");
            eventsByDay = {};

            data.forEach((event) => {
                const day = Number(event.day || String(event.date).match(/[0-9]+/)?.[0]);

                if (Number.isInteger(day) && day >= 1 && day <= 31) {
                    eventsByDay[day] = event;
                }
            });

            renderCalendar();
            renderEventList();
        } catch (error) {
            console.error("Error loading events:", error);
            eventList.replaceChildren(createEmptyState("Unable to load events. Please try again."));
        }
    }

    function renderCalendar() {
        CampusBuzz.setText("eventCount", "Total Events: " + Object.keys(eventsByDay).length);

        document.querySelectorAll(".calendar a[data-day]").forEach((link) => {
            const day = Number(link.dataset.day);
            link.classList.toggle("has-event", Boolean(eventsByDay[day]));
            link.classList.remove("highlighted");
            link.setAttribute("aria-label", eventsByDay[day] ? "View event on July " + day : "No event on July " + day);
        });
    }

    function renderEventList() {
        eventList.replaceChildren();
        const events = Object.values(eventsByDay).sort((a, b) => Number(a.day) - Number(b.day));

        if (events.length === 0) {
            eventList.appendChild(createEmptyState("No upcoming events yet."));
            return;
        }

        events.forEach((event) => {
            const card = document.createElement("article");
            card.className = "event-card";

            const title = document.createElement("h2");
            title.textContent = event.title;

            const meta = document.createElement("p");
            meta.className = "meta-text";
            meta.textContent = event.date + " at " + event.time;

            const venue = document.createElement("p");
            venue.textContent = event.venue;

            const detailsLink = document.createElement("a");
            detailsLink.className = "button-link secondary compact-action";
            detailsLink.href = "eventdetails.html";
            detailsLink.textContent = "View Details";
            detailsLink.addEventListener("click", () => selectEvent(event));

            card.append(title, meta, venue, detailsLink);
            eventList.appendChild(card);
        });
    }

    function handleCalendarClick(event) {
        const link = event.target.closest("a[data-day]");

        if (!link) {
            return;
        }

        const day = Number(link.dataset.day);
        const selectedEvent = eventsByDay[day];

        if (!selectedEvent) {
            event.preventDefault();
            localStorage.removeItem("selectedEvent");
            alert("No event on this date.");
            return;
        }

        selectEvent(selectedEvent);
    }

    function selectEvent(event) {
        localStorage.setItem("selectedEvent", JSON.stringify(event));
    }

    function searchEvent() {
        const day = Number(searchInput.value);
        const allDates = document.querySelectorAll(".calendar a[data-day]");

        allDates.forEach((link) => link.classList.remove("highlighted"));
        searchResult.replaceChildren();

        if (!Number.isInteger(day) || day < 1 || day > 31) {
            searchResult.appendChild(createEmptyState("Enter a valid July date from 1 to 31."));
            return;
        }

        const matchingEvent = eventsByDay[day];
        const matchingLink = document.querySelector('.calendar a[data-day="' + day + '"]');

        if (matchingLink) {
            matchingLink.classList.add("highlighted");
        }

        if (!matchingEvent) {
            searchResult.appendChild(createEmptyState("No event found on July " + day + "."));
            return;
        }

        renderEventSummary(searchResult, matchingEvent);
    }

    function renderEventSummary(container, event) {
        const title = document.createElement("h3");
        title.textContent = event.title;

        const date = document.createElement("p");
        date.textContent = event.date + " at " + event.time;

        const venue = document.createElement("p");
        venue.textContent = event.venue;

        container.append(title, date, venue);
    }

    function createEmptyState(message) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = message;
        return empty;
    }
}
