const output = document.getElementById("output");
const input = document.getElementById("input");
const typingBox = document.getElementById("typing");

// 🔒 SET OWNER USERNAME HERE
const OWNER_USERNAME = "RVEPRTY";

let username = localStorage.getItem("tt_username");
if (!username) {
  username = prompt("Choose a username (permanent):");
  localStorage.setItem("tt_username", username);
}

function getRole(user) {
  return user === OWNER_USERNAME ? "OWNER" : "USER";
}

function addLine(user, text) {
  const role = getRole(user);
  const span = document.createElement("span");
  span.className = role === "OWNER" ? "owner" : "user";
  span.textContent = `[${role}] ${user}: ${text}`;
  output.appendChild(span);
  output.appendChild(document.createElement("br"));
  output.scrollTop = output.scrollHeight;
}

async function fetchMessages() {
  const res = await fetch("/api/messages");
  const data = await res.json();
  output.innerHTML = "";
  data.forEach(msg => addLine(msg.user, msg.text));
}

async function fetchTyping() {
  const res = await fetch("/api/typing");
  const data = await res.json();
  const othersTyping = data.users.filter(u => u !== username);
  typingBox.textContent = othersTyping.length > 0 ? `${othersTyping.join(", ")} typing...` : "";
}

let typingTimeout;

input.addEventListener("input", async () => {
  await fetch("/api/typing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: username, typing: true })
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, typing: false })
    });
  }, 1500);
});

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, text: input.value })
    });

    await fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, typing: false })
    });

    input.value = "";
    fetchMessages();
  }
});

setInterval(fetchMessages, 2000);
setInterval(fetchTyping, 1000);

fetchMessages();
fetchTyping();
