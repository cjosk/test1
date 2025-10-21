'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from './AuthProvider';

const navigation = [
  { label: 'Anasayfa', href: '/', icon: '🏠' },
  {
    label: 'Ürün Kategorisi',
    icon: '📦',
    children: [
      { label: 'Tüm Ürünler', href: '/products' },
      { label: 'Şeffaf Ürün', href: '/products/seffaf' },
      { label: 'Baskılı Ürün', href: '/products/baskili' },
      { label: 'Canvas Neon', href: '/products/canvas-neon' },
      { label: 'Neon Masa', href: '/products/neon-masa' },
      { label: 'Neon Ayna', href: '/products/neon-ayna' },
      { label: 'Takım Dekoru', href: '/products/takim-dekoru' }
    ]
  },
  {
    label: 'Sipariş Kategorisi',
    icon: '🚚',
    children: [
      { label: 'Tüm Durumlar', href: '/orders' },
      { label: 'Çizilmeyi Bekleyenler', href: '/orders/status/cizilmeyi-bekleyenler' },
      { label: 'Çizildi', href: '/orders/status/cizildi' },
      { label: 'Üretime Alındı', href: '/orders/status/uretime-alindi' },
      { label: 'Üretimi Tamamlandı', href: '/orders/status/uretimi-tamamlandi' },
      { label: 'Kargo Aşamasında', href: '/orders/status/kargo-asamasinda' },
      { label: 'Gönderilen Ürünler', href: '/orders/status/gonderilen' },
      { label: 'Gecikti', href: '/orders/status/gecikti' }
    ]
  },
  { label: 'Sipariş Ekle', href: '/orders/new', icon: '➕' },
  { label: 'Finansal Raporlar', href: '/finance', icon: '💰' },
  { label: 'Admin Yönetimi', href: '/admin', icon: '⚙️' }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-orange-100 bg-white/80 p-6 shadow-glass backdrop-blur-lg md:flex">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wide text-gray-400">Neonbir</p>
        <h1 className="text-2xl font-bold text-neon">Neon1 ERP</h1>
      </div>
      <nav className="flex-1 space-y-6 text-sm">
        {navigation.map((item) => (
          <div key={item.label}>
            <SidebarItem item={item} activePath={pathname} />
          </div>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="mt-6 w-full rounded-lg border border-neon/40 px-4 py-2 text-sm font-semibold text-neon transition hover:bg-neon hover:text-white"
      >
        Çıkış Yap
      </button>
    </aside>
  );
}

function SidebarItem({ item, activePath }) {
  if (item.children) {
    return (
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>{item.icon}</span>
          {item.label}
        </p>
        <div className="space-y-1 border-l border-orange-100 pl-4">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={clsx(
                'block rounded-md px-3 py-2 transition hover:bg-orange-50',
                activePath === child.href && 'bg-orange-100 text-neon'
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-orange-50',
        activePath === item.href && 'bg-orange-100 text-neon'
      )}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  );
}
