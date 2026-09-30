import React from 'react';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import Providers from '../src/components/Providers';
import MainLayout from '../src/components/MainLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Remedial & Tuition Classes Portal | UMS',
  description: 'Academic remediation and ongoing tuition class tracking system for students and faculty.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader showSpinner={false} color="#0085db" />
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
