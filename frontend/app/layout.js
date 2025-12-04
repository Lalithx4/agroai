import './globals.css';
import './dashboard.css';
import './pages.css';
import Header from '@/components/layout/Header';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

export const metadata = {
  title: 'CropMagix - AI Farming Assistant',
  description: 'CropMagix - AI-powered agricultural assistant for plant health analysis and farming guidance',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'CropMagix'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <Header />
              <main className="app-main">
                {children}
              </main>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
