let messages = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    messages.push({
      user: req.body.user,
      text: req.body.text
    });

    if (messages.length > 100) messages.shift();

    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json(messages);
  }

  res.status(405).end();
}
