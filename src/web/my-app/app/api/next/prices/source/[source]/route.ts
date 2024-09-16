import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { source: string } }
  ) {
    try {
      const source = params.source;
      
      const res = await fetch(`http://app:3000/api/prices/source/${source}`);

      if (!res.ok) { // Check for HTTP status codes other than 2xx
        throw new Error(`Error fetching data: ${res.status} ${res.statusText}`);
      }

      const prices = await res.json();
      
      const sourcePrices = prices.filter((price) => price.source === source)

      if (source && sourcePrices) {

        const response = sourcePrices.map((price) => {
            return {
                "productId": price.productId,
                "source": price.source,
                "date": price.date,
                "price": Math.min(...price.options.map(option => option.price))
              }
          });

          console.log(response)

          return NextResponse.json(response)
      } else {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      return new NextResponse('Internal Server Error', { status: 500 }); 
    }
}