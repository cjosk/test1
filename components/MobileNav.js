'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';

const OPTIONS = [
  { label: 'Anasayfa', value: '/' },
  { label: 'Tüm Siparişler', value: '/orders' },
  { label: 'Sipariş Ekle', value: '/orders/new' },
  { label: 'Finansal Raporlar', value: '/finance' },
  { label: 'Admin Yönetimi', value: '/admin' }
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const activeValue = useMemo(() => {
    const match = OPTIONS.find((option) => pathname.startsWith(option.value));
    return match ? match.value : '/';
  }, [pathname]);

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/70 p-3 shadow-sm md:hidden">
      <span className="text-xs font-semibold uppercase text-gray-400">Navigasyon</span>
      <select
        value={activeValue}
        onChange={(event) => router.push(event.target.value)}
        className="flex-1 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:border-neon focus:outline-none"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
