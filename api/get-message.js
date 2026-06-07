const { neon } = require('@neondatabase/serverless');
import { checkRateLimit } from '@vercel/firewall';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  //rate-limiting
  const { rateLimited } = await checkRateLimit('id-lookup', { req });
  if (rateLimited) {
    return res.status(429).json({
      error: 'Too many requests'
    });
  }

  await sql`DELETE FROM your_table WHERE expires_at < NOW()`;

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT cipher_text FROM morse_messages WHERE id = ${id}
  `;

  if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });

  res.status(200).json({ cipherText: rows[0].cipher_text });
};