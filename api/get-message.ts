import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT cipher_text FROM morse_messages WHERE id = ${id}
  `;

  if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });

  res.status(200).json({ cipherText: rows[0].cipher_text });
}