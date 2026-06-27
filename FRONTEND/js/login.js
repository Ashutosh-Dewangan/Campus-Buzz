const dummyUsers = [
    {
        rollNo: "25116083",
        email: "student1@nitrr.ac.in",
        role: "Student",
        name: "Rahul Dubey"
    },
    {
        rollNo: "24115078",
        email: "club@nitrr.ac.in",
        role: "Club Member",
        name: "Coding Club"
    },
    {
        rollNo: "24115079",
        email: "student2@nitrr.ac.in",
        role: "Student",
        name: "Aman Sharma"
    },
    {
        rollNo: "23118055",
        email: "admin@nitrr.ac.in",
        role: "Admin",
        name: "Admin"
    }
];

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const rollNo = document.getElementById("rollNo").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();

    if (!rollNo || !email) {
        alert("Please fill in all fields.");
        return;
    }

    if (!email.endsWith("@nitrr.ac.in")) {
        alert("Please use your institute email address.");
        return;
    }

    const foundUser = dummyUsers.find((user) => user.rollNo === rollNo && user.email === email);

    if (!foundUser) {
        alert("Invalid credentials.");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    window.location.href = "feed.html";
});
