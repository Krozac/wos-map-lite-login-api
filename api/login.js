import fetch from 'node-fetch';
import crypto from 'crypto';

const API_URL = 'https://wos-giftcode-api.centurygame.com/api/player';
const SECRET = 'tB87#kPtkxqOS2';

export default async function handler(req, res) {
  // Allow only your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://whiteout-planner.krozac.fr');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });

  const time = Date.now();
  const form = `fid=${id}&time=${time}`;
  const sign = crypto.createHash('md5').update(form + SECRET).digest('hex'); // ✅ ESM-compatible
  const body = `sign=${sign}&fid=${id}&time=${time}`;

  try {
    const fetchRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://wos-giftcode.centurygame.com',
        'Referer': 'https://wos-giftcode.centurygame.com/',
        'User-Agent': 'Mozilla/5.0',
      },
      body,
    });

    const text = await fetchRes.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch {
      return res.status(500).json({ success: false, message: text });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
