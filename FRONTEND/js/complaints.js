let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}

let complaints = [];

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
    let complaintContainer = document.getElementById("complaintContainer");
    complaintContainer.innerHTML = "";
    complaints.forEach(function(complaint, index) {
        let complaintCard = document.createElement("div");
        complaintCard.classList.add("complaint-card");
        const statusClass = complaint.status.toLowerCase().replace(/\s+/g, '-');
        complaintCard.innerHTML = `
        <h3>${escapeHtml(complaint.title)}</h3>
        <p>${escapeHtml(complaint.text)}</p>
        <p><strong>Location:</strong> ${escapeHtml(complaint.location || 'Not specified')}</p>
        <p><strong>Status:</strong> <span class="status ${statusClass}">${escapeHtml(complaint.status)}</span></p>
        ${
            complaint.owner === currentUser.email &&
            complaint.status !== "Resolved"
            ?
            `<button class="success" onclick="resolveComplaint(${index})">Mark as Resolved</button>`
            :
            ""
        }`;
        complaintContainer.appendChild(complaintCard);
    });
}

async function addComplaint() {
    try {
        if (currentUser.role !== "Student") {
            alert("Only students can raise complaints");
            return;
        }
        
        let title = document.getElementById("complaintTitle").value;
        let text = document.getElementById("complaintText").value;
        let location = document.getElementById("complaintLocation")?.value || "";
        
        if (!title || !text) {
            alert("Please fill all required fields");
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
            alert("Complaint marked as resolved.");
        }
    } catch (error) {
        console.error("Error resolving complaint:", error);
    }
}
