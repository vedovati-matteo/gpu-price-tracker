import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('/api/sources');
  const sources = await res.json();
  return NextResponse.json(sources)
}