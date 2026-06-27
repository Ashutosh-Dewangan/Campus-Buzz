let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

let events = {};

async function loadEvents() {
    const response = await fetch("/http://loaclhost:3000/events");
    if (!response.ok) {
        alert("Unable to load events.");
        return;
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
}

function renderEvents() {
    document.getElementById("eventCount").innerText =
        "Total Events: " + Object.keys(events).length;

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
    let day = prompt("Enter date to search:");
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
        result.innerHTML = "No event found.";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

loadEvents();
