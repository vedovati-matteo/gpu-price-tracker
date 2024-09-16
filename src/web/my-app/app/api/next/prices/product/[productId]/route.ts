import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { productId: string } }
  ) {
    try {
      const productId = params.productId;
      
      const res = await fetch(`http://app:3000/api/prices/product/${productId}`);

      if (!res.ok) { // Check for HTTP status codes other than 2xx
        throw new Error(`Error fetching data: ${res.status} ${res.statusText}`);
      }

      const prices = await res.json();

      const productPrices = prices.filter((price) => price.productId === productId)

      if (productId && productPrices.length > 0) {

        const response = productPrices.map((price) => {
            return {
                "productId": price.productId,
                "source": price.source,
                "date": price.date,
                "price": Math.min(...price.options.map(option => option.price))
              }
          });

          return NextResponse.json(response)
      } else {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      return new NextResponse('Internal Server Error', { status: 500 }); 
    }
}