
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, phone } = req.body;
    try {
      const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/22909312/27596qv/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!zapierRes.ok) throw new Error('Zapier request failed');
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
