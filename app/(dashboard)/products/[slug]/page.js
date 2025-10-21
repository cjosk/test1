'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { db } from '../../../../lib/firebase';
import Loader from '../../../../components/Loader';

const CATEGORY_LABELS = {
  seffaf: 'Şeffaf Ürün',
  baskili: 'Baskılı Ürün',
  'canvas-neon': 'Canvas Neon',
  'neon-masa': 'Neon Masa',
  'neon-ayna': 'Neon Ayna',
  'takim-dekoru': 'Takım Dekoru'
};

export default function ProductCategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const slug = params?.slug;
  const label = CATEGORY_LABELS[slug] || 'Kategori';

  useEffect(() => {
    if (!slug) return;
    const q = query(collection(db, 'products'), where('categorySlug', '==', slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Kategori ürünleri yükleniyor" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-semibold text-gray-900">{label}</h2>
        <p className="text-sm text-gray-500">Bu kategoriye ait neon ürünlerini inceleyin.</p>
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
            <p className="mt-2 text-sm font-semibold text-neon">
              ₺{product.price?.toLocaleString('tr-TR') || '0'}
            </p>
            <p className="mt-2 text-xs text-gray-400">Stok: {product.stock ?? 'Belirtilmemiş'}</p>
          </article>
        ))}
        {products.length === 0 && (
          <p className="rounded-3xl bg-white/70 p-6 text-sm text-gray-500">Bu kategoride henüz ürün yok.</p>
        )}
      </div>
    </div>
  );
}
