let typingUsers = [];

export default function handler(req,res){
  const { username } = req.body || {};
  if(req.method==="POST" && username){
    if(!typingUsers.includes(username)) typingUsers.push(username);
    setTimeout(()=>{ typingUsers = typingUsers.filter(u=>u!==username); }, 1000);
    return res.status(200).json({ typing:true });
  }
  if(req.method==="GET"){ return res.status(200).json({ typing: typingUsers }); }
  res.status(405).json({ error:"Method not allowed" });
}
