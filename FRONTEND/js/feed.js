const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();
    CampusBuzz.setText("userRole", "Logged in as: " + currentUser.role);

    let posts = [];
    let activeFilter = "All";

    const postForm = document.getElementById("postForm");
    const postContainer = document.getElementById("postContainer");
    const filterButtons = document.querySelectorAll(".filter-button");

    postForm.addEventListener("submit", addPost);
    postContainer.addEventListener("click", handlePostAction);

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            displayPosts();
        });
    });

    loadPosts();
    setInterval(updateTimers, 1000);

    async function loadPosts() {
        try {
            posts = await CampusBuzz.api("/posts");
            displayPosts();
        } catch (error) {
            console.error("Error loading posts:", error);
            showEmptyState("Unable to load posts. Please try again later.");
        }
    }

    function displayPosts() {
        postContainer.replaceChildren();

        const visiblePosts = activeFilter === "All"
            ? posts
            : posts.filter((post) => post.hashtag === activeFilter);

        if (visiblePosts.length === 0) {
            showEmptyState("No posts to show right now.");
            return;
        }

        visiblePosts.forEach((post) => {
            postContainer.appendChild(createPostCard(post));
        });
    }

    function createPostCard(post) {
        const postCard = document.createElement("article");
        postCard.className = "post-card";

        const author = document.createElement("p");
        author.className = "meta-text";
        author.textContent = post.user || "Campus member";

        const title = document.createElement("h2");
        title.textContent = post.title || "Untitled post";

        const content = document.createElement("p");
        content.textContent = post.content || "";

        postCard.append(author, title, content);

        if (post.image) {
            const image = document.createElement("img");
            image.src = post.image;
            image.alt = post.title ? "Image for " + post.title : "Post image";
            image.loading = "lazy";
            postCard.appendChild(image);
        }

        if (post.hashtag) {
            const tag = document.createElement("button");
            tag.type = "button";
            tag.className = "hashtag-tag";
            tag.dataset.action = "hashtag";
            tag.dataset.hashtag = post.hashtag;
            tag.dataset.user = post.user || "this student";
            tag.textContent = post.hashtag;
            postCard.appendChild(tag);
        }

        const timer = document.createElement("p");
        timer.className = "timer";
        timer.dataset.postId = String(post.id);
        postCard.appendChild(timer);

        if (post.owner === currentUser.email) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger-button";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.postId = String(post.id);
            deleteButton.textContent = "Delete";
            postCard.appendChild(deleteButton);
        }

        updateTimerForPost(post, timer);
        return postCard;
    }

    function showEmptyState(message) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = message;
        postContainer.replaceChildren(empty);
    }

    function updateTimers() {
        let changed = false;
        const now = Date.now();

        posts.forEach((post) => {
            if (!post.expiry) {
                return;
            }

            if (Number(post.expiry) <= now) {
                changed = true;
                removeExpiredPost(post.id);
                return;
            }

            const timer = document.querySelector('[data-post-id="' + post.id + '"]');
            if (timer) {
                updateTimerForPost(post, timer);
            }
        });

        if (changed) {
            displayPosts();
        }
    }

    function updateTimerForPost(post, timerElement) {
        if (!post.expiry) {
            timerElement.textContent = "";
            return;
        }

        const remainingSeconds = Math.max(0, Math.ceil((Number(post.expiry) - Date.now()) / 1000));
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerElement.textContent = "Expires in: " + minutes + "m " + String(seconds).padStart(2, "0") + "s";
    }

    async function removeExpiredPost(postId) {
        posts = posts.filter((post) => post.id !== postId);

        try {
            await CampusBuzz.api("/posts/" + postId, { method: "DELETE" });
        } catch (error) {
            console.error("Expired post cleanup failed:", error);
        }
    }

    async function addPost(event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const title = document.getElementById("postTitle").value.trim();
        const content = document.getElementById("content").value.trim();
        const image = document.getElementById("imageUrl").value.trim();
        const hashtag = document.getElementById("hashtag").value;

        if (!username || !title || !content || !hashtag) {
            alert("Please fill all required fields.");
            return;
        }

        const newPost = {
            user: username,
            title,
            content,
            image,
            hashtag,
            owner: currentUser.email,
            expiry: hashtag === "#foodsplit" || hashtag === "#cabsplit" ? Date.now() + 900000 : null
        };

        try {
            const result = await CampusBuzz.api("/posts", {
                method: "POST",
                body: JSON.stringify(newPost)
            });

            posts.unshift(result.post);
            postForm.reset();
            activeFilter = "All";
            filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === "All"));
            displayPosts();
        } catch (error) {
            console.error("Error adding post:", error);
            alert(error.message || "Unable to save post. Please try again.");
        }
    }

    async function handlePostAction(event) {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        if (button.dataset.action === "hashtag") {
            handleHashtag(button.dataset.hashtag, button.dataset.user);
            return;
        }

        if (button.dataset.action === "delete") {
            await deletePost(Number(button.dataset.postId));
        }
    }

    async function deletePost(postId) {
        if (!postId || !confirm("Delete this post?")) {
            return;
        }

        try {
            await CampusBuzz.api("/posts/" + postId, { method: "DELETE" });
            posts = posts.filter((post) => post.id !== postId);
            displayPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert(error.message || "Unable to delete post. Please try again.");
        }
    }

    function handleHashtag(hashtag, user) {
        if (["#foodsplit", "#cabsplit", "#resell"].includes(hashtag)) {
            localStorage.setItem("chatTopic", hashtag);
            window.location.href = "chat.html";
            return;
        }

        if (["#lost", "#found"].includes(hashtag)) {
            alert("Contact " + user + " directly.");
        }
    }
}
