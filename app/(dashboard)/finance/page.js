'use client';

import { useEffect, useMemo, useState } from 'react';
import { Timestamp, collection, onSnapshot, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { db } from '../../../lib/firebase';
import Loader from '../../../components/Loader';

function getRevenueByMonth(orders) {
  const map = new Map();
  orders.forEach((order) => {
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    const key = format(date, 'yyyy-MM');
    const current = map.get(key) || 0;
    map.set(key, current + (order.totalPrice || 0));
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, revenue]) => ({ month: format(new Date(`${key}-01`), 'MMM yyyy', { locale: tr }), revenue }));
}

export default function FinancePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'orders'));
    if (startDate) {
      q = query(q, where('createdAt', '>=', Timestamp.fromDate(new Date(startDate))));
    }
    if (endDate) {
      q = query(q, where('createdAt', '<=', Timestamp.fromDate(new Date(endDate))));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [startDate, endDate]);

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const activeRevenue = orders
      .filter((order) => !['Gönderilen Ürünler'].includes(order.status))
      .reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const shippedRevenue = orders
      .filter((order) => order.status === 'Gönderilen Ürünler')
      .reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    return { totalRevenue, activeRevenue, shippedRevenue };
  }, [orders]);

  const monthlyRevenue = useMemo(() => getRevenueByMonth(orders), [orders]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Finansal raporlar yükleniyor" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold text-gray-900">Finansal Raporlar</h2>
        <p className="text-sm text-gray-500">Gelirlerinizi sipariş durumlarına ve aylara göre analiz edin.</p>
      </header>

      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Filtreler</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium uppercase text-gray-500">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-2 text-sm focus:border-neon focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-gray-500">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white/80 px-4 py-2 text-sm focus:border-neon focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="w-full rounded-lg border border-neon/30 px-4 py-2 text-sm font-semibold text-neon hover:bg-orange-50"
            >
              Filtreyi Temizle
            </button>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard title="Toplam Gelir" value={`₺${metrics.totalRevenue.toLocaleString('tr-TR')}`} />
        <MetricCard title="Aktif Gelir" value={`₺${metrics.activeRevenue.toLocaleString('tr-TR')}`} />
        <MetricCard title="Gönderilen Gelir" value={`₺${metrics.shippedRevenue.toLocaleString('tr-TR')}`} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800">Aylık Gelir Dağılımı</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₺${value / 1000}k`} />
                <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`} />
                <Bar dataKey="revenue" fill="#ff7a00" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800">Güncel Sipariş Gelirleri</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <LineChart data={orders.map((order) => ({ name: order.productName, total: order.totalPrice || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `₺${value / 1000}k`} />
                <Tooltip formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`} />
                <Line type="monotone" dataKey="total" stroke="#ff7a00" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg">
      <p className="text-xs uppercase tracking-wide text-gray-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}
