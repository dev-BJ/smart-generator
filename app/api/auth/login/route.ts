import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

  const result = await pool.query('SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2 LIMIT 1', [email, password])
  const user = result.rows[0]
  if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  const response = NextResponse.json({ user })
  response.cookies.set('voltwatch_user', String(user.id), {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
