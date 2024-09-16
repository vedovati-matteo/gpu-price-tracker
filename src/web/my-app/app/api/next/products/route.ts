import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('http://app:3000/api/products');

    if (!res.ok) { // Check for HTTP status codes other than 2xx
      throw new Error(`Error fetching data: ${res.status} ${res.statusText}`);
    }

    const products = await res.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return new NextResponse('Internal Server Error', { status: 500 }); 
  }
}