const API_BASE = window.location.port === "5000" ? "" : "http://localhost:5000";
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
document.getElementById("userRole").innerText =
    "Logged in as: " + currentUser.role;
// FIX: Replace hardcoded 'Ashutosh' greeting — reads actual logged-in user's name
const greetEl = document.getElementById("greetName");
if (greetEl) greetEl.innerText = currentUser.name || currentUser.email;
let posts = [];

async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE}/api/posts`);

        console.log("Status:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to load posts: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("Data:", data);

        posts = data;

        console.log("Posts:", posts);

        displayPosts();

    } catch (error) {
        console.error("Error loading posts:", error);
        alert("Unable to load posts. Please try again later.");
    }
}

function displayPosts() {
    let postContainer = document.getElementById("postContainer");
    postContainer.innerHTML = "";
    posts.forEach(function(post, index) {
        let postCard = document.createElement("div");
        postCard.classList.add("post-card");
        postCard.innerHTML = `
        <h3>${escapeHtml(post.user)}</h3>
        <h4>${escapeHtml(post.title)}</h4>
        <p>${escapeHtml(post.content)}</p>
        ${post.image ? `<img src="${post.image.startsWith('/') ? API_BASE + escapeHtml(post.image) : escapeHtml(post.image)}" width="200" alt="Post image">` : ""}
        <p class="hashtag-tag" onclick="handleHashtag('${escapeHtml(post.hashtag)}', '${escapeHtml(post.user)}')">
        ${escapeHtml(post.hashtag)}
        </p>
        <p id="timer-${index}" class="timer"></p>          
        ${post.owner === currentUser.email ?
        `<button class="danger" onclick="deletePost(${index})">Delete</button>` : ""}
        `;
        postContainer.appendChild(postCard);
        console.log(post.image);
    });
}

function updateTimers() {
    let expiredAny = false;
    for (let i = posts.length - 1; i >= 0; i--) {
        let post = posts[i];
        if (post.expiry) {
            let remainingTime = Math.floor((post.expiry - Date.now()) / 1000);
            let timerElement = document.getElementById("timer-" + i);
            if (timerElement) {
                if (remainingTime > 0) {
                    // FIX: show H:MM:SS format instead of raw seconds
                    const h = Math.floor(remainingTime / 3600);
                    const m = Math.floor((remainingTime % 3600) / 60);
                    const s = remainingTime % 60;
                    const timeStr = h > 0
                        ? `${h}h ${m}m ${s}s`
                        : m > 0 ? `${m}m ${s}s` : `${s}s`;
                    timerElement.innerText = "⏱ Expires in: " + timeStr;
                }
                else {
                    posts.splice(i, 1);
                    expiredAny = true;
                }
            }
        }
    }
    if (expiredAny) {
        displayPosts();
    }
}

async function addPost() {
    try {
        let username = document.getElementById("username").value;
        let title = document.getElementById("postTitle").value;
        let content = document.getElementById("content").value;
        let image = document.getElementById("imageUrl").value;
        let hashtag = document.getElementById("hashtag").value;
        
        if (!username || !title || !content || !hashtag) {
            alert("Please fill all required fields");
            return;
        }
        
        let newPost = {
            user: username,
            title: title,
            content: content,
            image: image,
            hashtag: hashtag,
            owner: currentUser.email,
            expiry: null
        };
        
        if (hashtag === "#foodsplit" || hashtag === "#cabsplit") {
            newPost.expiry = Date.now() + 900000;
        }
        
        const response = await fetch(`${API_BASE}/api/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPost)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save post: ${response.status} ${response.statusText}`);
        }

        posts.unshift(newPost);
        document.getElementById("username").value = "";
        document.getElementById("postTitle").value = "";
        document.getElementById("content").value = "";
        document.getElementById("imageUrl").value = "";
        document.getElementById("hashtag").value = "";
        displayPosts();
        alert("Post created successfully!");
        
    } catch (error) {
        console.error("Error adding post:", error);
        alert("Unable to save post. Please try again.");
    }
}

async function deletePost(index) {
    if (confirm("Are you sure you want to delete this post?")) {
        try {
            // FIX: was only removing from local array; now syncs to backend via DELETE
            const response = await fetch(`${API_BASE}/api/posts/${index}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error("Failed to delete post on server");
            }
            posts.splice(index, 1);
            displayPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Unable to delete post. Please try again.");
        }
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

loadPosts();
setInterval(updateTimers, 1000);

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function handleHashtag(hashtag, user) {
    if (
        hashtag === "#foodsplit" ||
        hashtag === "#cabsplit" ||
        hashtag === "#resell"
    ) {
        localStorage.setItem("chatTopic", hashtag);
        window.location.href = "chat.html";
    }
    else if (
        hashtag === "#lost" ||
        hashtag === "#found"
    ) {
        alert("Contact " + user + " directly.");
    }
}
