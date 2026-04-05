import Navbar from '../../components/Navbar';

export default function BookLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="mt-12 py-6 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-center gap-2">
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
      </footer>
    </div>
  );
}
