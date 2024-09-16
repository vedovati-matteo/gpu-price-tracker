import { NextResponse } from 'next/server'

export async function GET() {
  console.log('-----------------API route hit');
  const res = await fetch('http://app:3000/api/products');
  const products = await res.json();
  return NextResponse.json(products)
}