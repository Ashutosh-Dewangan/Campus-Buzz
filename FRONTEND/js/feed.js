let currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Please login first");
    window.location.href = "login.html";
}
document.getElementById("userRole").innerText =
    "Logged in as: " + currentUser.role;
let posts = [];

async function loadPosts() {
    try {
        // namespaced API path to match backend
        const response = await fetch("/api/posts");

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
        ${post.image ? `<img src="${escapeHtml(post.image)}" width="200" alt="Post image">` : ""}
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
    posts.forEach(function(post, index) {
        if (post.expiry) {
            let remainingTime = Math.floor((post.expiry - Date.now()) / 1000);
            let timerElement = document.getElementById("timer-" + index);
            if (timerElement) {
                if (remainingTime > 0) {
                    timerElement.innerText =
                        "Expires in: " + remainingTime + " sec";
                }
                else {
                    posts.splice(index, 1);
                    displayPosts();
                }
            }
        }
    });
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
        
        // POST to namespaced API path
        const response = await fetch("/api/posts", {
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

function deletePost(index) {
    if (confirm("Are you sure you want to delete this post?")) {
        posts.splice(index, 1);
        displayPosts();
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
    return String(text).replace(/[&<>\"']/g, m => map[m]);
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
