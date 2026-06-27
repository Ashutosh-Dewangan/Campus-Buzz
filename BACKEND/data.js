// In-Memory Database for Campus Buzz

let posts = [
    {
        id: 1,
        user: "Ananya",
        title: "Food Share Split",
        content: "Order food with us. Live from Hostel Indrawati. Hurry up!!",
        image: "",
        hashtag: "#foodsplit",
        owner: "Ananya Pathak",
        expiry: Date.now() + 86400000, // 24 hours
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        user: "Rohit",
        title: "Cab to Airport",
        content: "Need a cab to the airport. Anyone going?",
        image: "",
        hashtag: "#cabsplit",
        owner: "Rohit Sharma",
        expiry: Date.now() + 43200000, // 12 hours
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        user: "Harshita",
        title: "Graphics Kit for Sale",
        content: "Selling my old Engineering Graphics Equipment. DM for details.",
        image: "",
        hashtag: "#resell",
        owner: "Harshita Gupta",
        expiry: null,
        createdAt: new Date().toISOString()
    }
];

let events = [
    {
        id: 1,
        day: 7,
        title: "Hackathon",
        date: "2026-07-07",
        time: "09:00",
        venue: "Auditorium",
        description: "24-hour coding challenge.",
        club: "Coding Club",
        registration: "Register at venue",
        rsvps: { going: [], interested: [] },
        createdAt: new Date().toISOString()
    }
];

let complaints = [
    {
        id: 1,
        title: "A/C not working",
        text: "The air conditioner in room F42 is not functioning properly.",
        location: "Room F42",
        status: "In Progress",
        owner: "student1@nitrr.ac.in",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Stray dogs in the campus",
        text: "There are stray dogs roaming around the campus and they are a danger to students.",
        location: "Central Park, Main Ground",
        status: "Pending",
        owner: "student2@nitrr.ac.in",
        createdAt: new Date().toISOString()
    }
];

let clubPosts = [
    {
        id: 1,
        title: "Official Coding Contest",
        content: "Coding Club is hosting a contest on CodeChef this Sunday.",
        formUrl: "https://forms.gle/dummy",
        author: "Coding Club President",
        authorEmail: "club@nitrr.ac.in",
        linkedEventId: null,
        createdAt: new Date().toISOString()
    }
];

let chatRooms = {};

let nextId = {
    posts: 4,
    events: 2,
    complaints: 3,
    clubPosts: 2
};

module.exports = {
    posts,
    events,
    complaints,
    clubPosts,
    chatRooms,
    nextId
};
