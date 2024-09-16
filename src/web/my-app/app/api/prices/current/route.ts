import { NextResponse } from 'next/server'

export async function GET() {
    
    const res = await fetch('http://app:3000/api/prices/current');
    const prices = await res.json();
    console.log("-----------", prices);
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
}
