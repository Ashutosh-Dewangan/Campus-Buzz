const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    let complaints = [];
    let selectedStatus = "All";

    const statusFilter = document.getElementById("statusFilter");
    const complaintContainer = document.getElementById("complaintContainer");

    statusFilter.addEventListener("change", () => {
        selectedStatus = statusFilter.value;
        displayComplaints();
    });

    complaintContainer.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-action='resolve']");

        if (!button) {
            return;
        }

        await resolveComplaint(Number(button.dataset.complaintId));
    });

    loadComplaints();

    async function loadComplaints() {
        try {
            complaints = await CampusBuzz.api("/complaints");
            displayComplaints();
        } catch (error) {
            console.error("Error loading complaints:", error);
            complaintContainer.replaceChildren(createEmptyState("Unable to load complaints. Please try again."));
        }
    }

    function displayComplaints() {
        complaintContainer.replaceChildren();

        const visibleComplaints = selectedStatus === "All"
            ? complaints
            : complaints.filter((complaint) => complaint.status === selectedStatus);

        if (visibleComplaints.length === 0) {
            complaintContainer.appendChild(createEmptyState("No complaints found with this status."));
            return;
        }

        visibleComplaints.forEach((complaint) => {
            complaintContainer.appendChild(createComplaintCard(complaint));
        });
    }

    function createComplaintCard(complaint) {
        const card = document.createElement("article");
        card.className = "complaint-card";

        const title = document.createElement("h2");
        title.textContent = complaint.title;

        const text = document.createElement("p");
        text.textContent = complaint.text;

        const category = createDetailLine("Category", complaint.category || "Not specified");
        const location = createDetailLine("Location", complaint.location || "Not specified");

        const statusLine = document.createElement("p");
        const statusLabel = document.createElement("strong");
        const statusBadge = document.createElement("span");
        statusLabel.textContent = "Status: ";
        statusBadge.className = "status status-" + String(complaint.status || "Pending").toLowerCase().replace(/\s+/g, "-");
        statusBadge.textContent = complaint.status || "Pending";
        statusLine.append(statusLabel, statusBadge);

        card.append(title, text, category, location, statusLine);

        const canResolve = complaint.status !== "Resolved" && (complaint.owner === currentUser.email || currentUser.role === "Admin");

        if (canResolve) {
            const resolveButton = document.createElement("button");
            resolveButton.type = "button";
            resolveButton.className = "success-button";
            resolveButton.dataset.action = "resolve";
            resolveButton.dataset.complaintId = String(complaint.id);
            resolveButton.textContent = "Mark as Resolved";
            card.appendChild(resolveButton);
        }

        return card;
    }

    function createDetailLine(label, value) {
        const line = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + ": ";
        line.append(strong, document.createTextNode(value));
        return line;
    }

    async function resolveComplaint(complaintId) {
        if (!complaintId || !confirm("Mark this complaint as resolved?")) {
            return;
        }

        try {
            const result = await CampusBuzz.api("/complaints/" + complaintId, {
                method: "PATCH",
                body: JSON.stringify({ status: "Resolved" })
            });

            complaints = complaints.map((complaint) => complaint.id === complaintId ? result.complaint : complaint);
            displayComplaints();
        } catch (error) {
            console.error("Error resolving complaint:", error);
            alert(error.message || "Unable to update complaint. Please try again.");
        }
    }

    function createEmptyState(message) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = message;
        return empty;
    }
}
