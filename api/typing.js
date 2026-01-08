let typingUsers = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { user, typing } = req.body;
    if (typing) {
      if (!typingUsers.includes(user)) typingUsers.push(user);
    } else {
      typingUsers = typingUsers.filter(u => u !== user);
    }
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json({ users: typingUsers });
  }

  res.status(405).end();
}
