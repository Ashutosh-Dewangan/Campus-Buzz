const CampusBuzz = (() => {
    const API_BASE = "/api";

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("currentUser"));
        } catch (error) {
            localStorage.removeItem("currentUser");
            return null;
        }
    }

    function requireAuth() {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert("Please login first.");
            window.location.replace("login.html");
            return null;
        }

        return currentUser;
    }

    function logout() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("chatTopic");
        window.location.href = "login.html";
    }

    async function api(path, options = {}) {
        const response = await fetch(API_BASE + path, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        let body = null;

        try {
            body = await response.json();
        } catch (error) {
            body = null;
        }

        if (!response.ok) {
            throw new Error((body && body.message) || "Request failed with status " + response.status + ".");
        }

        return body;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        }[char]));
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function bindLogoutButton() {
        const logoutButton = document.getElementById("logoutBtn");

        if (logoutButton) {
            logoutButton.addEventListener("click", logout);
        }
    }

    return {
        api,
        bindLogoutButton,
        escapeHtml,
        getCurrentUser,
        logout,
        requireAuth,
        setText
    };
})();
