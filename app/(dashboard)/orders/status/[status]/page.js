'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { db } from '../../../../../lib/firebase';
import Loader from '../../../../../components/Loader';

const STATUS_LABELS = {
  'cizilmeyi-bekleyenler': 'Çizilmeyi Bekleyenler',
  cizildi: 'Çizildi',
  'uretime-alindi': 'Üretime Alındı',
  'uretimi-tamamlandi': 'Üretimi Tamamlandı',
  'kargo-asamasinda': 'Kargo Aşamasında',
  gonderilen: 'Gönderilen Ürünler',
  gecikti: 'Gecikti'
};

const STATUS_STYLES = {
  'Gönderilen Ürünler': 'bg-gray-100 text-gray-600',
  'Kargo Aşamasında': 'bg-purple-100 text-purple-600',
  'Üretimi Tamamlandı': 'bg-green-100 text-green-600',
  'Üretime Alındı': 'bg-blue-100 text-blue-600',
  Çizildi: 'bg-sky-100 text-sky-600',
  'Çizilmeyi Bekleyenler': 'bg-yellow-100 text-yellow-700',
  Gecikti: 'bg-red-100 text-red-600'
};

export default function OrdersStatusPage() {
  const params = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusKey = params?.status;
  const statusLabel = STATUS_LABELS[statusKey] || null;

  useEffect(() => {
    if (!statusLabel) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'orders'), where('status', '==', statusLabel));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [statusLabel]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Sipariş durumu yükleniyor" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-3xl font-semibold text-gray-900">{statusLabel ?? 'Durum'}</h2>
        <p className="text-sm text-gray-500">Bu durumdaki siparişlerin listesini görüntüleyin.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <article key={order.id} className="glass-card flex flex-col justify-between rounded-3xl p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              {order.imageUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                  <Image src={order.imageUrl} alt={order.productName} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-xs text-orange-600">
                  Görsel
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{order.productName}</h3>
                <p className="text-sm text-gray-500">{order.customerName}</p>
                <p className="text-xs text-gray-400">
                  {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'd MMM yyyy, HH:mm', { locale: tr }) : '-'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 md:mt-0">
              <span className={`badge ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
              <p className="text-sm font-semibold text-gray-700">
                ₺{order.totalPrice != null ? order.totalPrice.toLocaleString('tr-TR') : '-'}
              </p>
              <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-neon hover:underline">
                Detay
              </Link>
            </div>
          </article>
        ))}
        {orders.length === 0 && (
          <p className="rounded-3xl bg-white/80 p-6 text-sm text-gray-500">Bu durumda sipariş bulunmuyor.</p>
        )}
      </div>
    </section>
  );
}
