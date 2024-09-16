import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('/api/products');
  const products = await res.json();
  return NextResponse.json(products)
}