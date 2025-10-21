'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { db } from '../../../lib/firebase';
import Loader from '../../../components/Loader';

const STATUS_STYLES = {
  'Gönderilen Ürünler': 'bg-gray-100 text-gray-600',
  'Kargo Aşamasında': 'bg-purple-100 text-purple-600',
  'Üretimi Tamamlandı': 'bg-green-100 text-green-600',
  'Üretime Alındı': 'bg-blue-100 text-blue-600',
  Çizildi: 'bg-sky-100 text-sky-600',
  'Çizilmeyi Bekleyenler': 'bg-yellow-100 text-yellow-700',
  Gecikti: 'bg-red-100 text-red-600'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', sort === 'desc' ? 'desc' : 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sort]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    return orders.filter((order) => {
      const term = search.toLowerCase();
      return (
        order.customerName?.toLowerCase().includes(term) ||
        order.productName?.toLowerCase().includes(term) ||
        order.id?.toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Siparişler yükleniyor" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Tüm Siparişler</h2>
          <p className="text-sm text-gray-500">Neonbir siparişlerini durumlarına göre görüntüleyin ve yönetin.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara: müşteri, ürün, ID"
            className="w-64 rounded-lg border border-gray-200 bg-white/80 px-4 py-2 text-sm focus:border-neon focus:outline-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:border-neon focus:outline-none"
          >
            <option value="desc">En yeni</option>
            <option value="asc">En eski</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white/70 shadow-glass">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-orange-50/60 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4">Görsel</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4">Aksesuarlar</th>
              <th className="px-6 py-4">Müşteri İsmi</th>
              <th className="px-6 py-4">Ürün İsmi</th>
              <th className="px-6 py-4">Toplam Ücret</th>
              <th className="px-6 py-4">Eklenme Zamanı</th>
              <th className="px-6 py-4">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/80">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="transition hover:bg-orange-50/50">
                <td className="px-6 py-4">
                  {order.imageUrl ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-100">
                      <Image src={order.imageUrl} alt={order.productName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-xs font-semibold text-orange-600">
                      Yok
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {Array.isArray(order.accessories) ? order.accessories.join(', ') : order.accessories || '-'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-700">{order.customerName}</td>
                <td className="px-6 py-4 text-gray-600">{order.productName}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ₺{order.totalPrice != null ? order.totalPrice.toLocaleString('tr-TR') : '-'}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'd MMM yyyy, HH:mm', { locale: tr }) : '-'}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  <Link href={`/orders/${order.id}`} className="text-neon hover:underline">
                    {order.id}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">Aramanıza uygun sipariş bulunamadı.</div>
        )}
      </div>
    </section>
  );
}
