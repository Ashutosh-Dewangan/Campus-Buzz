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
        const response = await fetch("/complaints");
        if (!response.ok) {
            throw new Error(`Failed to load complaints: ${response.status} ${response.statusText}`);
        }
        complaints = await response.json();
        displayComplaints();
    } catch (error) {
        console.error("Error loading complaints:", error);
        alert("Unable to load complaints. Please try again.");
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
        
        let newComplaint = {
            title: title,
            text: text,
            location: location,
            status: "Pending",
            owner: currentUser.email
        };
        
        const response = await fetch("/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newComplaint)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save complaint: ${response.status} ${response.statusText}`);
        }
        
        complaints.unshift(newComplaint);
        document.getElementById("complaintTitle").value = "";
        document.getElementById("complaintText").value = "";
        if (document.getElementById("complaintLocation")) {
            document.getElementById("complaintLocation").value = "";
        }
        displayComplaints();
        alert("Complaint submitted successfully!");
        
    } catch (error) {
        console.error("Error adding complaint:", error);
        alert("Unable to save complaint. Please try again.");
    }
}

function filterComplaints() {
    try {
        let selectedStatus = document.getElementById("statusFilter").value.trim();
        if (selectedStatus === "All") {
            displayComplaints();
            return;
        }
        
        let filteredComplaints = complaints.filter(function(complaint) {
            return complaint.status === selectedStatus;
        });
        
        let complaintContainer = document.getElementById("complaintContainer");
        complaintContainer.innerHTML = "";
        
        if (filteredComplaints.length === 0) {
            complaintContainer.innerHTML = "<p>No complaints found with this status.</p>";
            return;
        }
        
        filteredComplaints.forEach(function(complaint, index) {
            let complaintCard = document.createElement("div");
            complaintCard.classList.add("complaint-card");
            const statusClass = complaint.status.toLowerCase().replace(/\s+/g, '-');
            complaintCard.innerHTML = `
                <h3>${escapeHtml(complaint.title)}</h3>
                <p>${escapeHtml(complaint.text)}</p>
                <p><strong>Location:</strong> ${escapeHtml(complaint.location || 'Not specified')}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${escapeHtml(complaint.status)}</span></p>
            `;
            complaintContainer.appendChild(complaintCard);
        });
        
    } catch (error) {
        console.error("Error filtering complaints:", error);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

loadComplaints();

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function resolveComplaint(index) {
    try {
        if (confirm("Mark this complaint as resolved?")) {
            complaints[index].status = "Resolved";
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
