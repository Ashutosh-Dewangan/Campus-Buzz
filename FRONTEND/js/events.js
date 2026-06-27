const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

let events = {};

async function loadEvents() {
    try {
        // call namespaced API path
        const response = await fetch(`${API_BASE}/api/events`);
        if (!response.ok) {
            throw new Error(`Failed to load events: ${response.status}`);
        }
        const data = await response.json();
        events = {};
        data.forEach(function(event) {
            const day = event.day || Number(String(event.date).match(/\d+/)?.[0]);
            if (day) {
                events[day] = event;
            }
        });
        renderEvents();
    } catch (error) {
        console.error("Error loading events:", error);
        alert("Unable to load events. Please try again.");
    }
}

function renderEvents() {
    document.getElementById("eventCount").innerText =
        "Total Events: " + Object.keys(events).length;

    // FIX: Hide the Add Event button for Students (only Club/Admin can add events)
    if (currentUser.role === "Student") {
        const addLink = document.getElementById("add-event-link");
        if (addLink) addLink.style.display = "none";
    }

    let allDates = document.querySelectorAll(".calendar a");
    allDates.forEach(function(link) {
        const day = link.textContent;
        link.style.fontWeight = "";
        link.style.color = "";
        link.style.backgroundColor = "";

        if (events[day]) {
            link.style.fontWeight = "bold";
            link.style.color = "green";
        }

        link.onclick = function() {
            if (events[day]) {
                localStorage.setItem("selectedEvent", JSON.stringify(events[day]));
            }
            else {
                localStorage.removeItem("selectedEvent");
            }
        };
    });

    const list = document.getElementById("eventList");
    list.innerHTML = "";
    for (const day in events) {
        list.innerHTML += `
            <div class="event-card">
                <h3>${events[day].title}</h3>
                <p>${events[day].date}</p>
                <p>${events[day].venue}</p>
            </div>
        `;
    }
}

function searchEvent() {
    // FIX: was using prompt() — now reads from the #searchDayInput text field in events.html
    let day = document.getElementById("searchDayInput")?.value?.trim();
    if (!day) {
        alert("Please enter a day number to search.");
        return;
    }
    let result = document.getElementById("searchResult");
    let allDates = document.querySelectorAll(".calendar a");
    allDates.forEach(function(link) {
        link.style.backgroundColor = "";
    });
    if (events[day]) {
        allDates.forEach(function(link) {
            if (link.textContent == day) {
                link.style.backgroundColor = "yellow";
            }
        });
        result.innerHTML = `
            <h3>${events[day].title}</h3>
            <p>${events[day].date}</p>
            <p>${events[day].venue}</p>
        `;
    }
    else {
        result.innerHTML = "No event found on day " + day + ".";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

loadEvents();
