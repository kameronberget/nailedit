import type { NextApiRequest, NextApiResponse } from 'next'

// Note: This API route will not work with static export
// Deploy this as a serverless function (Vercel, Netlify, etc.)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { productType, size, productName, amount, inspirationImages, inspirationLinks, designNotes } = req.body

    // Build description with inspiration details
    let description = productName
    if (productType === 'custom' && size) {
      description += ` - Size: ${size}`
    }
    if (inspirationLinks || designNotes) {
      description += '\n\nCustomer Inspiration:'
      if (inspirationLinks) description += `\nLinks: ${inspirationLinks}`
      if (designNotes) description += `\nNotes: ${designNotes}`
    }

    // Determine if this is a subscription or one-time payment
    const isSubscription = productType === 'subscription'
    const mode = isSubscription ? 'subscription' : 'payment'

    // Create price data
    const priceData: any = {
      currency: 'usd',
      product_data: {
        name: productName,
        description: description,
      },
    }

    if (isSubscription) {
      // For subscriptions, use recurring pricing
      priceData.recurring = {
        interval: 'month',
      }
      priceData.unit_amount = amount
    } else {
      // For one-time payments
      priceData.unit_amount = amount
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        productType: productType || 'custom',
        size: size || '',
        hasInspirationImages: inspirationImages?.length > 0 ? 'true' : 'false',
        inspirationLinks: inspirationLinks || '',
        designNotes: designNotes || '',
      },
    })

    res.status(200).json({ id: session.id })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
}

