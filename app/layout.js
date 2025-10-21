import './globals.css';
import Sidebar from '../components/Sidebar';
import AuthProvider from '../components/AuthProvider';
import MobileNav from '../components/MobileNav';
import { Inter } from 'next/font/google';

export const metadata = {
  title: 'Neon1 ERP',
  description: 'Neonbir üretim yönetimi için ERP sistemi'
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`min-h-screen flex bg-[#f8f9fa] ${inter.className}`}>
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <MobileNav />
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
