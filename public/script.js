const output = document.getElementById("output");
const input = document.getElementById("input");

let username = localStorage.getItem("tt_username");

if (!username) {
  username = prompt("Choose a username (permanent):");
  localStorage.setItem("tt_username", username);
}

function addLine(text) {
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

async function fetchMessages() {
  const res = await fetch("/api/messages");
  const data = await res.json();

  output.innerHTML = "";
  data.forEach(msg => {
    addLine(`[${msg.user}]: ${msg.text}`);
  });
}

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: username,
        text: input.value
      })
    });

    input.value = "";
    fetchMessages();
  }
});

// refresh every 2 seconds
setInterval(fetchMessages, 2000);
fetchMessages();
