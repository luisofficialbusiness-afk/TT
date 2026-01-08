import roles from "./roles";

let messages = [];

export default function handler(req, res) {
  if(req.method === "POST") {
    const { user, text } = req.body;
    const role = roles[user] || "USER";

    // Command Handling
    if(text.startsWith("!")) {
      let cmd = text.split(" ")[0].toLowerCase();
      const args = text.split(" ").slice(1);

      switch(cmd) {
        case "!saysystem":
          if(role !== "OWNER") return res.status(403).json({error:"Owner only"});
          messages.push({user:"SYSTEM", text: args.join(" "), type:"system"});
          break;

        case "!mute":
          if(role !== "OWNER") return res.status(403).json({error:"Owner only"});
          messages.push({user:"SYSTEM", text: `User ${args[0]} muted (simulated).`, type:"system"});
          break;

        case "!roll":
          const roll = Math.floor(Math.random()*100)+1;
          messages.push({user:"SYSTEM", text:`${user} rolled a ${roll}`, type:"system"});
          break;

        case "!roles":
          messages.push({user:"SYSTEM", text:`Role: ${role}`, type:"system"});
          break;

        case "!whoami":
          messages.push({user:"SYSTEM", text:`Username: ${user}, Role: ${role}`, type:"system"});
          break;

        case "!lockdown":
          if(role !== "OWNER") return res.status(403).json({error:"Owner only"});
          messages.push({user:"SYSTEM", text:"Chat is now in LOCKDOWN (simulated).", type:"system"});
          break;

        case "!help":
          messages.push({user:"SYSTEM", text:"Commands: !saysystem, !mute, !roll, !roles, !whoami, !lockdown, !help", type:"system"});
          break;

        default:
          messages.push({user:"SYSTEM", text:"Unknown command.", type:"system"});
      }
    } else {
      messages.push({user,text,type:"user"});
    }

    if(messages.length>100) messages.shift();
    return res.status(200).json({ok:true});
  }

  if(req.method === "GET") return res.status(200).json(messages);
  res.status(405).end();
}
