import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('http://app:3000/api/prices/current');

    if (!res.ok) { // Check for HTTP status codes other than 2xx
      throw new Error(`Error fetching data: ${res.status} ${res.statusText}`);
    }

    const prices = await res.json();
    const response = {
      "date": prices[0].date,
      "prices": prices.flatMap(entry => 
        entry.options.map(option => ({
          productId: entry.productId,
          source: entry.source,
          name: option.name,
          price: option.price,
          href: option.href,
          condition: option.condition
        }))
      )
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return new NextResponse('Internal Server Error', { status: 500 }); 
  }
}