import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db'

export async function GET() {
  const userId = (await cookies()).get('voltwatch_user')?.value
  if (!userId || !/^\d+$/.test(userId)) return NextResponse.json({ user: null }, { status: 401 })
  const result = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1 LIMIT 1', [Number(userId)])
  if (!result.rows[0]) return NextResponse.json({ user: null }, { status: 401 })
  return NextResponse.json({ user: result.rows[0] })
}
