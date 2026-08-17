import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/auth-provider';

export const metadata: Metadata = {
  title: { default: 'PulseOps', template: '%s · PulseOps' },
  description: 'API uptime, latency, and incident monitoring for development teams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
