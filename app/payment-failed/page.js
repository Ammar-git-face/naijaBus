'use client';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Error icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your payment was not completed. Your seat has not been booked.
            Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book"
              className="inline-block bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-block bg-gray-100 text-gray-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
