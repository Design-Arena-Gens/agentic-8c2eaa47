import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Table Booking Calling Agent',
  description: 'Automated agent that places calls to book tables',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
