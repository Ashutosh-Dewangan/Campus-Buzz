let chatTopic = localStorage.getItem("chatTopic");
document.getElementById("chatTitle").innerText =
    "Chat Room: " + chatTopic;
let messages = [];
function sendMessage() {
    let message = document.getElementById("message").value;
    if (!message) {
        alert("Enter a message");
        return;
    }
    messages.push(message);
    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<p>${message}</p>`;
    document.getElementById("message").value = "";
}