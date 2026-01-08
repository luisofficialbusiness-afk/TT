let isLocked = false;

export default function handler(req, res) {
  if(req.method==="POST") {
    const { action } = req.body;
    if(action==="enable") isLocked = true;
    if(action==="disable") isLocked = false;
    return res.status(200).json({locked:isLocked});
  }
  if(req.method==="GET") return res.status(200).json({locked:isLocked});
  res.status(405).end();
}
