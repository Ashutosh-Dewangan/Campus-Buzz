const dummyUsers = [
    {
        rollNo: "25116083",
        email: "student1@nitrr.ac.in",
        role: "Student"
    },
    {
        rollNo: "24115078",
        email: "club@nitrr.ac.in",
        role: "Club member"
    },
    {
        rollNo: "24115078",
        email: "student2@nitrr.ac.in",
        role: "Student"
    },
    {
        rollNo: "23118055",
        email: "admin@nitrr.ac.in",
        role: "Admin"
    }
];

function login() {
    let rollNo = document.getElementById("rollNo").value.trim();
    let email = document.getElementById("email").value.trim();

    // Validate inputs
    if (!rollNo || !email) {
        alert("Please fill in all fields");
        return;
    }

    let foundUser = dummyUsers.find(function(user) {
        return user.rollNo === rollNo && user.email === email;
    });

    if (!foundUser) {
        alert("Invalid credentials");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    alert("Login successful as " + foundUser.role);
    window.location.href = "feed.html";
}
