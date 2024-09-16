import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('http://app:3000/api/sources');
  const sources = await res.json();
  return NextResponse.json(sources)
}