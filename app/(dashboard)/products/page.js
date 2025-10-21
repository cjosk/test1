'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '../../../lib/firebase';
import Loader from '../../../components/Loader';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Ürünler yükleniyor" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-semibold text-gray-900">Tüm Ürünler</h2>
        <p className="text-sm text-gray-500">Neonbir ürün portföyünü yönetin, stokları ve kategorileri kontrol edin.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="glass-card rounded-3xl p-6">
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl bg-orange-50">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Görsel yok</div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="mt-2 text-sm text-gray-500">Kategori: {product.category || 'Belirtilmemiş'}</p>
            <p className="mt-2 text-sm font-semibold text-neon">
              ₺{product.price?.toLocaleString('tr-TR') || '0'}
            </p>
          </article>
        ))}
        {products.length === 0 && (
          <p className="rounded-3xl bg-white/70 p-6 text-sm text-gray-500">Henüz ürün bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
