import { useEffect, useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Success() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (router.query.session_id) {
      setSessionId(router.query.session_id as string)
    }
  }, [router.query])

  return (
    <>
      <Head>
        <title>Order Successful - Beauty Nails</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-pink-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-elegant font-bold text-gray-900 mb-4">
            Order Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your custom nail design is being prepared just for you.
          </p>
          {sessionId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: {sessionId.substring(0, 20)}...
            </p>
          )}
          <Link
            href="/"
            className="btn-primary inline-block"
          >
            Return Home
          </Link>
        </div>
      </main>
    </>
  )
}

