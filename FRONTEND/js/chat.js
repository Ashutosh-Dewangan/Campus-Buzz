const currentUser = CampusBuzz.requireAuth();

if (currentUser) {
    CampusBuzz.bindLogoutButton();

    const chatTopic = localStorage.getItem("chatTopic");

    if (!chatTopic) {
        alert("Choose a chat topic from the feed first.");
        window.location.href = "feed.html";
    } else {
        const storageKey = "chatMessages:" + chatTopic;
        const chatBox = document.getElementById("chatBox");
        const messageForm = document.getElementById("messageForm");
        const messageInput = document.getElementById("message");
        let messages = loadMessages();

        CampusBuzz.setText("chatTitle", "Chat Room: " + chatTopic);
        renderMessages();

        messageForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const messageText = messageInput.value.trim();

            if (!messageText) {
                alert("Enter a message.");
                return;
            }

            messages.push({
                text: messageText,
                sender: currentUser.name || currentUser.email,
                sentAt: new Date().toISOString()
            });

            localStorage.setItem(storageKey, JSON.stringify(messages));
            messageInput.value = "";
            renderMessages();
        });

        function loadMessages() {
            try {
                return JSON.parse(localStorage.getItem(storageKey)) || [];
            } catch (error) {
                return [];
            }
        }

        function renderMessages() {
            chatBox.replaceChildren();

            if (messages.length === 0) {
                const empty = document.createElement("p");
                empty.className = "empty-state";
                empty.textContent = "No messages yet.";
                chatBox.appendChild(empty);
                return;
            }

            messages.forEach((message) => {
                const item = document.createElement("article");
                item.className = "chat-message";

                const meta = document.createElement("p");
                meta.className = "meta-text";
                meta.textContent = message.sender + " - " + new Date(message.sentAt).toLocaleString();

                const text = document.createElement("p");
                text.textContent = message.text;

                item.append(meta, text);
                chatBox.appendChild(item);
            });

            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}
