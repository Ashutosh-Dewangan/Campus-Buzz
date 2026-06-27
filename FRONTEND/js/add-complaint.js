const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    if (currentUser.role !== "Student") {
        alert("Only students can raise complaints.");
        window.location.href = "complaints.html";
    } else {
        const complaintForm = document.getElementById("complaintForm");

        complaintForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitButton = complaintForm.querySelector("button[type='submit']");
            const newComplaint = {
                title: document.getElementById("title").value.trim(),
                category: document.getElementById("category").value,
                location: document.getElementById("location").value.trim(),
                text: document.getElementById("description").value.trim(),
                status: "Pending",
                owner: currentUser.email
            };

            if (!newComplaint.title || !newComplaint.category || !newComplaint.text) {
                alert("Please fill all required fields.");
                return;
            }

            submitButton.disabled = true;

            try {
                await CampusBuzz.api("/complaints", {
                    method: "POST",
                    body: JSON.stringify(newComplaint)
                });

                window.location.href = "complaints.html";
            } catch (error) {
                console.error("Error submitting complaint:", error);
                alert(error.message || "Unable to save complaint. Please try again.");
                submitButton.disabled = false;
            }
        });
    }
}
