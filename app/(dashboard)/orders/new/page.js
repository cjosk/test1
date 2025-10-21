'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../lib/firebase';

const STATUS_OPTIONS = [
  'Çizilmeyi Bekleyenler',
  'Çizildi',
  'Üretime Alındı',
  'Üretimi Tamamlandı',
  'Kargo Aşamasında',
  'Gönderilen Ürünler',
  'Gecikti'
];

const ACCESSORY_OPTIONS = ['Dimmer', 'Montaj Aparatı', 'Yedek Adaptör', 'UV Baskı', 'Stand'];

export default function OrderCreatePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (data) => {
    setUploading(true);
    setMessage('');

    try {
      let imageUrl = '';
      if (data.image?.length) {
        const imageFile = data.image[0];
        const storageRef = ref(storage, `product_images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const accessories = Array.isArray(data.accessories)
        ? data.accessories
        : data.accessories
        ? [data.accessories]
        : [];
      const quantity = Number(data.quantity || 1);
      const unitPrice = Number(data.price || 0);
      const totalPrice = unitPrice * quantity;

      await addDoc(collection(db, 'orders'), {
        productName: data.productName,
        customerName: data.customerName,
        category: data.category,
        status: data.status,
        targetDeliveryDate: data.targetDeliveryDate ? new Date(data.targetDeliveryDate) : null,
        franchiseId: data.franchiseId,
        imageUrl,
        accessories,
        notes: data.notes,
        unitPrice,
        quantity,
        totalPrice,
        createdAt: serverTimestamp()
      });

      setMessage('Sipariş başarıyla eklendi.');
      reset();
    } catch (error) {
      console.error('Order create error', error);
      setMessage('Sipariş eklenirken bir sorun oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900">Yeni Sipariş Ekle</h2>
        <p className="text-sm text-gray-500">Üretim hattına yeni bir sipariş kaydı oluşturun.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-6 rounded-3xl p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Ürün İsmi</label>
            <input
              {...register('productName', { required: 'Bu alan zorunludur' })}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
            {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Müşteri İsmi</label>
            <input
              {...register('customerName', { required: 'Bu alan zorunludur' })}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Kategori</label>
            <input
              {...register('category', { required: 'Bu alan zorunludur' })}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Fiyat</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Bu alan zorunludur' })}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Adet</label>
            <input
              type="number"
              min="1"
              defaultValue={1}
              {...register('quantity')}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Üretim Durumu</label>
            <select
              {...register('status', { required: 'Bu alan zorunludur' })}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Hedef Teslim Tarihi</label>
            <input
              type="date"
              {...register('targetDeliveryDate')}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">Franchise ID</label>
            <input
              {...register('franchiseId')}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Görsel Yükle</label>
          <input
            type="file"
            accept="image/*"
            {...register('image')}
            className="w-full rounded-lg border border-dashed border-orange-200 bg-white/60 px-4 py-5 text-sm focus:border-neon focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Aksesuar Seçimi</label>
          <div className="flex flex-wrap gap-3">
            {ACCESSORY_OPTIONS.map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" value={item} {...register('accessories')} className="rounded border-gray-300" />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Notlar</label>
          <textarea
            rows={4}
            {...register('notes')}
            className="w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
          />
        </div>

        {message && <p className="rounded-lg bg-orange-50 p-4 text-sm text-orange-600">{message}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-neon px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
        >
          {uploading ? 'Yükleniyor…' : 'Siparişi Kaydet'}
        </button>
      </form>
    </div>
  );
}
