import { NextResponse } from 'next/server'

export async function GET() {
  console.error('-----------------API route hit - /api/products-----------------');
  const res = await fetch('http://app:3000/api/products');
  const products = await res.json();
  return NextResponse.json(products)
}