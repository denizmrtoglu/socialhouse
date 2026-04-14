import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// GEÇİCİ DEBUG ENDPOINT — role doğrulandıktan sonra sil
export async function GET() {
  const { userId, sessionClaims } = await auth()
  return NextResponse.json({ userId, sessionClaims })
}
