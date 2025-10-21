'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STATUS_OPTIONS = [
  'Çizilmeyi Bekleyenler',
  'Çizildi',
  'Üretime Alındı',
  'Üretimi Tamamlandı',
  'Kargo Aşamasında',
  'Gönderilen Ürünler',
  'Gecikti'
];

export default function OrderEditModal({ open, onClose, order }) {
  const [formState, setFormState] = useState(order);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormState(order);
  }, [order]);

  if (!open || !order) return null;

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: formState.status,
        notes: formState.notes,
        accessories: formState.accessories,
        franchiseId: formState.franchiseId
      });
      onClose();
    } catch (error) {
      console.error('Order update failed', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Sipariş Güncelle</h3>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
            Kapat
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500">Üretim Durumu</label>
              <select
                value={formState?.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:border-neon focus:outline-none"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500">Franchise ID</label>
              <input
                value={formState?.franchiseId || ''}
                onChange={(e) => handleChange('franchiseId', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:border-neon focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase text-gray-500">Aksesuarlar</label>
            <input
              value={Array.isArray(formState?.accessories) ? formState.accessories.join(', ') : formState?.accessories || ''}
              onChange={(e) =>
                handleChange(
                  'accessories',
                  e.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                )
              }
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm focus:border-neon focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Her aksesuarı virgül ile ayırın.</p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase text-gray-500">Notlar</label>
            <textarea
              value={formState?.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-3 text-sm focus:border-neon focus:outline-none"
              rows={4}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
