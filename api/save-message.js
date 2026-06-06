const { neon } = require('@neondatabase/serverless');
const { randomUUID } = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { cipherText } = req.body;
  if (!cipherText) return res.status(400).json({ error: 'Missing cipherText' });

  const sql = neon(process.env.DATABASE_URL);
  const id = randomUUID();

  await sql`
    INSERT INTO morse_messages (id, cipher_text)
    VALUES (${id}, ${cipherText})
  `;

  res.status(200).json({ id });
};