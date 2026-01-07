import CheckoutModal from '@/components/CheckoutModal'
import Head from 'next/head'
import SizingGuide from '@/components/SizingGuide'
import { useState } from 'react'

type ProductType = 'custom' | 'subscription' | 'starter-kit'

export default function Home() {
  const [showSizingGuide, setShowSizingGuide] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)

  const handleSizeSelected = (size: string) => {
    setSelectedSize(size)
    setShowSizingGuide(false)
    setShowCheckout(true)
    setSelectedProduct('custom')
  }

  const handleProductSelect = (product: ProductType) => {
    setSelectedProduct(product)
    setShowCheckout(true)
  }

  return (
    <>
      <Head>
        <title>Hand-Crafted Custom Nail Designs - Beauty Nails</title>
        <meta name="description" content="Designer hand-made nail designs crafted from your inspiration. Share your vision and we'll bring it to life." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-pink-50 pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-elegant font-bold text-gray-900 mb-6 leading-tight">
                  Hand-Crafted
                  <span className="text-primary-600 block">Nail Designs</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-4 font-light">
                  Designer-made nails crafted from your inspiration
                </p>
                <p className="text-lg text-gray-500 mb-8">
                  Share your vision, design, or inspo — we&apos;ll bring it to life, one nail at a time
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a
                    href="#products"
                    className="btn-primary text-lg text-center"
                  >
                    Shop Now
                  </a>
                  <button
                    onClick={() => setShowSizingGuide(true)}
                    className="btn-secondary text-lg"
                  >
                    Use Sizing Guide
                  </button>
                </div>
              </div>
              <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-2xl font-elegant">Hand-Made With Love</p>
                    <p className="text-lg mt-2">Your Inspiration, Our Craftsmanship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold text-center mb-4 text-gray-900">
              Hand-Crafted Just For You
            </h2>
            <p className="text-center text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
              Every set is personally crafted by our designer, bringing your unique vision to life
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-2xl font-elegant font-semibold mb-4 text-gray-900">Your Inspiration</h3>
                <p className="text-gray-600">
                  Share your design ideas, inspo photos, or Pinterest boards. We&apos;ll craft your vision into reality.
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50">
                <div className="text-5xl mb-4">✋</div>
                <h3 className="text-2xl font-elegant font-semibold mb-4 text-gray-900">Hand-Made Quality</h3>
                <p className="text-gray-600">
                  Each nail is carefully hand-crafted by our designer, ensuring unique, personal attention to detail
                </p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-pink-50">
                <div className="text-5xl mb-4">💝</div>
                <h3 className="text-2xl font-elegant font-semibold mb-4 text-gray-900">One-of-a-Kind</h3>
                <p className="text-gray-600">
                  Your design is yours alone. We create custom sets that reflect your personal style and preferences
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold text-center mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-center text-xl text-gray-600 mb-16">
              From your inspiration to hand-crafted perfection
            </p>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                  1
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900">Share Your Inspiration</h3>
                  <p className="text-gray-600">
                    Upload photos, Pinterest links, or describe your dream design. Our designer will review your vision and bring it to life.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                  2
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900">Perfect Fit Measurement</h3>
                  <p className="text-gray-600">
                    Use our AI sizing guide to ensure your nails fit perfectly. We&apos;ll measure your nails precisely for a custom fit.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                  3
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900">Hand-Crafted Creation</h3>
                  <p className="text-gray-600">
                    Our designer hand-crafts each nail with attention to detail, ensuring your design is perfectly executed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-elegant font-bold mb-4 text-gray-900 text-center">
              Choose Your Perfect Option
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              From one-time custom designs to monthly subscriptions, we have the perfect option for you
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Custom Nail Design */}
              <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col">
                <div className="text-5xl mb-4 text-center">🎨</div>
                <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900 text-center">
                  Custom Nail Design
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  One-time custom design made from your inspiration
                </p>
                <div className="mt-auto">
                  <p className="text-4xl font-bold text-primary-600 mb-2 text-center">$49.99</p>
                  <p className="text-sm text-gray-500 mb-6 text-center">One-time payment</p>
                  <button
                    onClick={() => handleProductSelect('custom')}
                    className="btn-primary text-lg w-full"
                  >
                    Create Custom Design
                  </button>
                </div>
              </div>

              {/* Monthly Subscription */}
              <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col border-2 border-primary-200 relative">
                <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <div className="text-5xl mb-4 text-center">💎</div>
                <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900 text-center">
                  Monthly Subscription
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Get a fresh set of custom nails delivered every month
                </p>
                <div className="mt-auto">
                  <p className="text-4xl font-bold text-primary-600 mb-2 text-center">$24.99</p>
                  <p className="text-sm text-gray-500 mb-6 text-center">per month</p>
                  <button
                    onClick={() => handleProductSelect('subscription')}
                    className="btn-primary text-lg w-full"
                  >
                    Start Subscription
                  </button>
                </div>
              </div>

              {/* Starter Kit */}
              <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col">
                <div className="text-5xl mb-4 text-center">📦</div>
                <h3 className="text-2xl font-elegant font-semibold mb-2 text-gray-900 text-center">
                  Nails Starter Kit
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Everything you need to get started with custom nails
                </p>
                <div className="mt-auto">
                  <p className="text-4xl font-bold text-primary-600 mb-2 text-center">$49.99</p>
                  <p className="text-sm text-gray-500 mb-6 text-center">One-time payment</p>
                  <button
                    onClick={() => handleProductSelect('starter-kit')}
                    className="btn-primary text-lg w-full"
                  >
                    Get Starter Kit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sizing Guide Modal */}
        {showSizingGuide && (
          <SizingGuide
            onClose={() => setShowSizingGuide(false)}
            onSizeSelected={handleSizeSelected}
          />
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            selectedSize={selectedSize}
            productType={selectedProduct || 'custom'}
          />
        )}
      </main>
    </>
  )
}

