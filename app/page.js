import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-green-700 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 text-white text-sm px-4 py-1.5 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            Nigeria&apos;s Trusted Bus Booking Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Book Your Bus Ticket<br />
            Anywhere Anytime in Nigeria
          </h1>
          <p className="text-white text-opacity-90 text-base mb-8 max-w-md mx-auto" style={{ opacity: 0.9 }}>
            Fast, secure, and convenient. Select your route, pick a seat, pay online,
            and receive your e-ticket instantly.
          </p>
          <Link
            href="/book"
            className="inline-block bg-white text-green-700 font-semibold text-sm px-8 py-3 rounded-full hover:bg-gray-50 transition-colors"
          >
            Book a Ticket Now
          </Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Why Choose <span className="text-green-700">NaijaBus</span>?
          </h2>
          <p className="text-gray-500 text-sm mb-10">A simple, reliable ticketing system built for Nigerian travellers.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left shadow-sm">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Wide Network</h3>
              <p className="text-gray-500 text-xs">Routes connecting major cities across Nigeria</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left shadow-sm">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Secure Payments</h3>
              <p className="text-gray-500 text-xs">Safe and reliable Flutterwave payment gateway</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left shadow-sm">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Instant Booking</h3>
              <p className="text-gray-500 text-xs">Get your e-ticket with QR code in seconds</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 text-left shadow-sm">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Real Routes</h3>
              <p className="text-gray-500 text-xs">Lagos, Abuja, Port Harcourt, Kano and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 px-4 bg-green-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Travel?</h2>
          <p className="text-gray-500 text-sm mb-6">Book your next trip in under 2 minutes.</p>
          <Link
            href="/book"
            className="inline-block bg-green-700 text-white font-semibold text-sm px-8 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            Start Booking
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">
            Naija<span className="text-green-700">Bus</span>
          </span>
        </div>
        <p className="text-gray-400 text-xs">
          © {new Date().getFullYear()} NaijaBus Ticketing System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
