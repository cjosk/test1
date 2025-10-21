'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { db } from '../../lib/firebase';
import SummaryCard from '../../components/SummaryCard';
import Loader from '../../components/Loader';

const STATUS_ORDER = [
  'Çizilmeyi Bekleyenler',
  'Çizildi',
  'Üretime Alındı',
  'Üretimi Tamamlandı',
  'Kargo Aşamasında',
  'Gönderilen Ürünler',
  'Gecikti'
];

const STATUS_COLORS = {
  'Çizilmeyi Bekleyenler': '#facc15',
  Çizildi: '#67e8f9',
  'Üretime Alındı': '#38bdf8',
  'Üretimi Tamamlandı': '#22c55e',
  'Kargo Aşamasında': '#a855f7',
  'Gönderilen Ürünler': '#9ca3af',
  Gecikti: '#ef4444'
};

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const metrics = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((order) => order.status !== 'Gönderilen Ürünler').length;
    const completed = orders.filter((order) => order.status === 'Üretimi Tamamlandı').length;
    const shipped = orders.filter((order) => order.status === 'Gönderilen Ürünler').length;
    const delayed = orders.filter((order) => order.status === 'Gecikti').length;
    return {
      total,
      active,
      completed,
      shipped,
      delayed
    };
  }, [orders]);

  const donutData = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      name: status,
      value: orders.filter((order) => order.status === status).length
    }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Sipariş verileri yükleniyor" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-gray-900">Merhaba, Neonbir Ekibi 👋</h2>
        <p className="text-sm text-gray-500">
          Üretim hattınızın performansını anlık olarak takip edin. Sipariş durumlarının dağılımı ve önemli metrikler aşağıda.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Aktif Sipariş" value={metrics.active} subtitle="Üretim veya kargo sürecindeki siparişler" />
        <SummaryCard title="Üretimi Biten" value={metrics.completed} subtitle="Üretimi tamamlanan siparişler" />
        <SummaryCard title="Kargolanan Sipariş" value={metrics.shipped} subtitle="Kargoya verilen siparişler" />
        <SummaryCard title="Toplam Sipariş" value={metrics.total} subtitle="Tüm kayıtlı siparişler" />
        <SummaryCard title="Geciken Ürün Sayısı" value={metrics.delayed} subtitle="Hedef teslim tarihi geçen siparişler" highlight />
      </section>

      <section className="glass-card grid grid-cols-1 gap-6 rounded-3xl p-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800">Aktif Sipariş Durum Dağılımı</h3>
          <p className="mt-2 text-sm text-gray-500">
            Üretim hattındaki siparişlerin her bir durumdaki dağılımını inceleyin. Bu metrikler gecikmeleri ve darboğazları görmenize yardımcı olur.
          </p>
        </div>
        <div className="lg:col-span-2">
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" formatter={(value) => `${value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
