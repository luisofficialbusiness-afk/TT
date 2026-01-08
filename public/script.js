const output = document.getElementById("output");
const input = document.getElementById("input");
const typingBox = document.getElementById("typing");

// 🔒 SET OWNER USERNAME HERE
const OWNER_USERNAME = "YOUR_USERNAME_HERE";

let username = localStorage.getItem("tt_username");
if (!username) {
  username = prompt("Choose a username (permanent):");
  localStorage.setItem("tt_username", username);
}

const lastUsernameChange = localStorage.getItem("tt_lastUsernameChange");
const oneMonth = 30*24*60*60*1000; // 1 month in ms

function getRole(user) {
  return user === OWNER_USERNAME ? "OWNER" : "USER";
}

function addLine(user, text, type="user") {
  const span = document.createElement("span");
  if(type === "system") span.className = "system";
  else span.className = getRole(user) === "OWNER" ? "owner" : "user";
  span.textContent = type === "system" ? `[SYSTEM]: ${text}` : `[${getRole(user)}] ${user}: ${text}`;
  output.appendChild(span);
  output.appendChild(document.createElement("br"));
  output.scrollTop = output.scrollHeight;
}

let messagesCache = [];

async function fetchMessages() {
  const res = await fetch("/api/messages");
  const data = await res.json();
  messagesCache = data;
  output.innerHTML = "";
  data.forEach(msg => addLine(msg.user, msg.text, msg.type || "user"));
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

// -------------------- COMMAND SYSTEM --------------------
async function executeCommand(commandLine) {
  const args = commandLine.trim().split(" ");
  const cmd = args.shift().toLowerCase();

  const role = getRole(username);

  switch(cmd) {
    case "!help":
      addLine("SYSTEM", `Available commands: !help, !id, !history, !saysystem, !mute, !roll, !roles, !typing, !whoami, !username, !lockdown`, "system");
      break;

    case "!id":
      addLine("SYSTEM", `Your ID: ${username}`, "system");
      break;

    case "!history":
      const last50 = messagesCache.slice(-50);
      last50.forEach(msg => addLine(msg.user, msg.text, msg.type || "user"));
      break;

    case "!saysystem":
      if(role !== "OWNER") return addLine("SYSTEM", "Only Owner can use !saysystem", "system");
      const sysMsg = args.join(" ");
      if(sysMsg) {
        await fetch("/api/messages", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({user: "SYSTEM", text: sysMsg, type: "system"})
        });
        fetchMessages();
      }
      break;

    case "!mute":
      if(role !== "OWNER") return addLine("SYSTEM", "Only Owner can use !mute", "system");
      const muteUser = args[0];
      if(!muteUser) return addLine("SYSTEM","Specify a user to mute","system");
      addLine("SYSTEM", `User ${muteUser} muted (simulated).`, "system");
      break;

    case "!roll":
      const roll = Math.floor(Math.random()*100)+1;
      addLine("SYSTEM", `${username} rolled a ${roll}`, "system");
      break;

    case "!roles":
      addLine("SYSTEM", `Your role: ${role}`, "system");
      break;

    case "!typing":
      fetchTyping();
      break;

    case "!whoami":
      addLine("SYSTEM", `Username: ${username}, Role: ${role}, ID: ${username}`, "system");
      break;

    case "!username":
      const now = Date.now();
      if(lastUsernameChange && now - lastUsernameChange < oneMonth) {
        addLine("SYSTEM", "Username can only be changed once per month.", "system");
        break;
      }
      const newName = args.join(" ");
      if(newName) {
        localStorage.setItem("tt_username", newName);
        localStorage.setItem("tt_lastUsernameChange", now);
        username = newName;
        addLine("SYSTEM", `Username changed to ${newName}`, "system");
      }
      break;

    case "!lockdown":
      if(role !== "OWNER") return addLine("SYSTEM","Only Owner can enable lockdown","system");
      addLine("SYSTEM","Chat is now in LOCKDOWN mode (simulated).", "system");
      break;

    default:
      addLine("SYSTEM", "Unknown command. Type !help for list.", "system");
  }
}

// -------------------- ENTER KEY --------------------
input.addEventListener("keydown", async (e) => {
  if(e.key === "Enter" && input.value.trim()) {
    const value = input.value;
    if(value.startsWith("!")) {
      await executeCommand(value);
    } else {
      await fetch("/api/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user:username, text:value, type:"user"})
      });
    }
    await fetch("/api/typing", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({user:username, typing:false})
    });
    input.value = "";
    fetchMessages();
  }
});

setInterval(fetchMessages, 2000);
setInterval(fetchTyping, 1000);

fetchMessages();
fetchTyping();
