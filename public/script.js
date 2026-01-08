const output = document.getElementById("output");
const input = document.getElementById("input");
const typingBox = document.getElementById("typing");

// 🔒 OWNER USERNAME
const OWNER_USERNAME = "RVEPRTY"; // <- Only this username is the Owner

let username = localStorage.getItem("tt_username");
if (!username) {
  username = prompt("Choose a username (permanent):");
  localStorage.setItem("tt_username", username);
}

function addLine(user, text, type="user") {
  const span = document.createElement("span");
  if(type==="system") span.className="system";
  else span.className = user === OWNER_USERNAME ? "owner" : "user";
  span.textContent = type==="system" ? `[SYSTEM]: ${text}` : `[${user === OWNER_USERNAME ? "OWNER" : "USER"}] ${user}: ${text}`;
  output.appendChild(span);
  output.appendChild(document.createElement("br"));
  output.scrollTop = output.scrollHeight;
}

async function sendMessage(msg) {
  await fetch("/api/messages", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user:username, text:msg})
  });
}

async function fetchMessages() {
  const res = await fetch("/api/messages");
  const data = await res.json();
  output.innerHTML="";
  data.forEach(msg => addLine(msg.user, msg.text, msg.type || "user"));
}

async function fetchTyping() {
  const res = await fetch("/api/typing");
  const data = await res.json();
  const othersTyping = data.users.filter(u=>u!==username);
  typingBox.textContent = othersTyping.length>0 ? `${othersTyping.join(", ")} typing...` : "";
}

// Typing
let typingTimeout;
input.addEventListener("input", async () => {
  await fetch("/api/typing", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({user:username, typing:true})
  });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await fetch("/api/typing", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({user:username, typing:false})
    });
  }, 1500);
});

// Send messages / commands
input.addEventListener("keydown", async (e) => {
  if(e.key === "Enter" && input.value.trim()) {
    const value = input.value.trim();
    await fetch("/api/messages", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user:username, text:value})
    });
    input.value="";
    await fetchMessages();
  }
});

setInterval(fetchMessages, 2000);
setInterval(fetchTyping, 1000);

fetchMessages();
fetchTyping();
