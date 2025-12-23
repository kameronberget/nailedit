import { FormEvent, useState } from 'react'

import { loadStripe } from '@stripe/stripe-js'

type ProductType = 'custom' | 'subscription' | 'starter-kit'

interface CheckoutModalProps {
  onClose: () => void
  selectedSize?: string | null
  productType?: ProductType
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

const productConfig = {
  custom: {
    name: 'Hand-Crafted Custom Nail Design',
    price: 4999,
    requiresInspiration: true,
    description: 'One-time custom design made from your inspiration',
  },
  subscription: {
    name: 'Monthly Nail Subscription',
    price: 2499,
    requiresInspiration: false,
    description: 'Get a fresh set of custom nails delivered every month',
  },
  'starter-kit': {
    name: 'Nails Starter Kit',
    price: 4999,
    requiresInspiration: false,
    description: 'Everything you need to get started with custom nails',
  },
}

export default function CheckoutModal({ onClose, selectedSize, productType = 'custom' }: CheckoutModalProps) {
  const [size, setSize] = useState(selectedSize || 'M')
  const [inspirationFiles, setInspirationFiles] = useState<File[]>([])
  const [inspirationLinks, setInspirationLinks] = useState('')
  const [designNotes, setDesignNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const product = productConfig[productType]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      // For static sites, you'll need to deploy the API route as a serverless function
      // Or use Stripe Payment Links. Update this URL to your deployed API endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/create-checkout-session'
      
      // Convert files to base64 for transmission (in production, upload to cloud storage)
      let fileDataUrls: string[] = []
      if (product.requiresInspiration && inspirationFiles.length > 0) {
        const filePromises = inspirationFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        })
        fileDataUrls = await Promise.all(filePromises)
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          size,
          productName: product.name,
          amount: product.price,
          inspirationImages: fileDataUrls,
          inspirationLinks: inspirationLinks,
          designNotes: designNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()

      if (session.error) {
        setError(session.error)
        setIsProcessing(false)
        return
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: session.id,
        })

        if (stripeError) {
          setError(stripeError.message || 'An error occurred')
          setIsProcessing(false)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-elegant font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{product.name}</h3>
            <p className="text-3xl font-bold text-primary-600 mb-6">
              ${(product.price / 100).toFixed(2)}
              {productType === 'subscription' && <span className="text-lg text-gray-500">/month</span>}
            </p>

            {product.requiresInspiration && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Share Your Inspiration
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload photos, Pinterest links, or describe your vision
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Inspiration Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setInspirationFiles(files)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                  {inspirationFiles.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {inspirationFiles.length} file(s) selected
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspiration Links (Pinterest, Instagram, etc.)
                  </label>
                  <textarea
                    value={inspirationLinks}
                    onChange={(e) => setInspirationLinks(e.target.value)}
                    placeholder="Paste links to your inspiration here..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Notes (Optional)
                  </label>
                  <textarea
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                    placeholder="Describe your design preferences, colors, style, or any specific details..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {productType !== 'starter-kit' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nail Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="LG">Large (LG)</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedSize 
                    ? `Using detected size: ${selectedSize}`
                    : 'Not sure? Use our Sizing Guide to find your perfect fit'}
                </p>
              </div>
            )}

            {productType === 'subscription' && (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Subscription Details:</span> You'll receive a new set of custom nails every month. 
                  Cancel anytime from your account dashboard.
                </p>
              </div>
            )}

            {productType === 'starter-kit' && (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Starter Kit Includes:</span>
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>Complete nail application kit</li>
                  <li>Nail glue and tools</li>
                  <li>Care instructions</li>
                  <li>Size guide</li>
                </ul>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="submit"
              disabled={isProcessing || (product.requiresInspiration && inspirationFiles.length === 0 && !inspirationLinks && !designNotes)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Continue to Payment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

