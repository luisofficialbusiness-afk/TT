// ===== Terminal Talker V1 Script with Permanent Login & !myid =====
const input = document.getElementById("terminal-input");
const messagesDiv = document.getElementById("messages");
const typingIndicator = document.getElementById("typing-indicator");

let username = "";
let room = "main";
let userId = Math.floor(Math.random()*1000000).toString();
let typingTimeout;

// Permanent Users for login
const USERS = {
  "ownerUser": { role: "owner", password: "O#0363168", id: "1001" },
  "adminUser": { role: "admin", password: "admin01", id: "1002" },
  "betaUser1": { role: "beta", password: "BETA123", id: "1003" }
};

// ===== Functions =====
function addSystemMessage(msg){
  const div = document.createElement("div");
  div.className = "terminal-msg";
  div.innerHTML = `<span style="color:#ff0">[SYSTEM]</span> ${msg}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addMessage(msg, user, role){
  const div = document.createElement("div");
  div.className = "terminal-msg";
  let badge = "";
  if(role==="owner") badge="[OWNER]";
  else if(role==="admin") badge="[ADMIN]";
  else if(role==="beta") badge="[BETA]";
  div.innerHTML = `${badge ? `<span class="badge">${badge}</span>` : ""}<strong>${user}:</strong> ${msg}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== Login Command =====
function loginCommand(msg){
  const parts = msg.split(" ");
  const command = parts[0];
  const password = parts[1];
  if(["!login","!ownlogin","!betalogin"].includes(command)){
    for(let user in USERS){
      if(USERS[user].password === password){
        username = user;
        userId = USERS[user].id;
        addSystemMessage(`Logged in as ${username} with role ${USERS[user].role}`);
        return USERS[user].role;
      }
    }
    addSystemMessage("Incorrect password");
  }
}

// ===== Send Message =====
async function sendMessage(msg){
  await fetch("/api/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username,message:msg,room})
  });
}

// ===== Typing =====
function setTyping(){
  fetch("/api/typing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username})});
}

// ===== Fetch Messages =====
async function fetchMessages(){
  const res = await fetch("/api/messages");
  const data = await res.json();
  messagesDiv.innerHTML="";
  data.forEach(m=>addMessage(m.message,m.username,m.role));
}
setInterval(fetchMessages,1000);

setInterval(async()=>{
  const res = await fetch("/api/typing");
  const data = await res.json();
  if(data.typing.length>0){
    typingIndicator.classList.remove("hidden");
    typingIndicator.innerText = `${data.typing.join(", ")} is typing...`;
  } else typingIndicator.classList.add("hidden");
},500);

// ===== Input Handling =====
input.addEventListener("input",()=>{
  clearTimeout(typingTimeout);
  setTyping();
  typingTimeout = setTimeout(()=>{},1000);
});

input.addEventListener("keydown",async(e)=>{
  if(e.key==="Enter" && input.value.trim()!==""){
    const msg = input.value.trim();

    // Login commands
    if(msg.startsWith("!login") || msg.startsWith("!ownlogin") || msg.startsWith("!betalogin")){
      loginCommand(msg);
      input.value="";
      return;
    }

    // Show User ID
    if(msg === "!myid"){
      addSystemMessage(`Your User ID is: ${userId}`);
      input.value="";
      return;
    }

    // Send normal messages
    input.value="";
    addMessage(msg,username,"user");
    await sendMessage(msg);
  }
});
