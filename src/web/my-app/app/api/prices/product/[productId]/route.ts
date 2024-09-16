import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { productId: string } }
  ) {
    const productId = params.productId;
    
    const res = await fetch(`/api/prices/product/${productId}`);

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

        console.log(response)

        return NextResponse.json(response)
    } else {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
}
