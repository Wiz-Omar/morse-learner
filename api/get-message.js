const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT cipher_text FROM morse_messages WHERE id = ${id}
  `;

  if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });

  res.status(200).json({ cipherText: rows[0].cipher_text });
};