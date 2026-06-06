import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { cipherText } = req.body as { cipherText?: string };
  if (!cipherText) return res.status(400).json({ error: 'Missing cipherText' });

  const sql = neon(process.env.DATABASE_URL!);
  const id = crypto.randomUUID();

  await sql`
    INSERT INTO morse_messages (id, cipher_text)
    VALUES (${id}, ${cipherText})
  `;

  res.status(200).json({ id });
}