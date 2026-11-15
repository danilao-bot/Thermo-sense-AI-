import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'ThermoSense AI — Occupational Heat-Health Telemetry',
  description: 'Precision physiological strain and heat-health monitoring console.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="bg-[#0D0F12] text-[#E8EBED] min-h-screen selection:bg-[#244CFF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
