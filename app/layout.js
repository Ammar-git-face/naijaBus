import './globals.css';

export const metadata = {
  title: 'NaijaBus — Book Bus Tickets Online',
  description: 'Nigeria\'s trusted bus ticketing platform. Book your bus ticket anywhere in Nigeria.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
