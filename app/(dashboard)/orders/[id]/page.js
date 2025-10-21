'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { db } from '../../../../lib/firebase';
import Loader from '../../../../components/Loader';
import OrderEditModal from '../../../../components/OrderEditModal';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', params.id), (docSnap) => {
      setOrder({ id: docSnap.id, ...docSnap.data() });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Sipariş detayları yükleniyor" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="glass-card space-y-4 rounded-3xl p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Sipariş bulunamadı</h2>
        <Link href="/orders" className="text-neon hover:underline">
          Tüm siparişlere dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href="/orders" className="text-sm text-neon hover:underline">
          ← Tüm Siparişlere Dön
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Sipariş #{order.id}</h2>
            <p className="text-sm text-gray-500">{order.productName}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Düzenle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card rounded-3xl p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800">Ürün Görseli</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100 bg-white/70">
            {order.imageUrl ? (
              <div className="relative aspect-square w-full">
                <Image src={order.imageUrl} alt={order.productName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-gray-400">Görsel yok</div>
            )}
          </div>
        </div>

        <div className="glass-card space-y-6 rounded-3xl p-6 lg:col-span-2">
          <section>
            <h3 className="text-lg font-semibold text-gray-800">Finansal Özet</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoCard label="Birim Fiyat" value={formatCurrency(order.unitPrice)} />
              <InfoCard label="Adet" value={order.quantity || 1} />
              <InfoCard label="Toplam" value={formatCurrency(order.totalPrice)} highlight />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard label="Müşteri İsmi" value={order.customerName} />
            <InfoCard label="Kategori" value={order.category} />
            <InfoCard
              label="Hedef Teslim Tarihi"
              value={formatDelivery(order.targetDeliveryDate)}
            />
            <InfoCard label="Franchise ID" value={order.franchiseId || '-'} />
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800">Aksesuarlar & Notlar</h3>
            <div className="mt-3 rounded-2xl bg-white/80 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700">Aksesuarlar:</p>
              <p className="mt-1 text-gray-500">
                {Array.isArray(order.accessories)
                  ? order.accessories.join(', ')
                  : order.accessories || 'Belirtilmemiş'}
              </p>
              <p className="mt-4 font-medium text-gray-700">Sipariş Notu:</p>
              <p className="mt-1 whitespace-pre-line text-gray-500">{order.notes || 'Not eklenmemiş'}</p>
            </div>
          </section>
        </div>
      </div>

      <OrderEditModal open={open} onClose={() => setOpen(false)} order={order} />
    </div>
  );
}

function InfoCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl border border-orange-100 bg-white/80 p-4 text-sm shadow-sm ${highlight ? 'text-neon' : 'text-gray-600'}`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function formatDelivery(value) {
  if (!value) return 'Belirtilmemiş';
  if (typeof value === 'string') {
    return format(new Date(value), 'd MMM yyyy', { locale: tr });
  }
  if (value?.toDate) {
    return format(value.toDate(), 'd MMM yyyy', { locale: tr });
  }
  if (value instanceof Date) {
    return format(value, 'd MMM yyyy', { locale: tr });
  }
  return 'Belirtilmemiş';
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return '₺-';
  }
  return `₺${Number(value).toLocaleString('tr-TR')}`;
}
