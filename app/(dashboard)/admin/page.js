'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import Loader from '../../../components/Loader';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'production', label: 'Üretim' },
  { value: 'shipping', label: 'Kargo' }
];

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', role: 'production' });
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
    };
  }, []);

  const roleCounts = useMemo(() => {
    return ROLES.map((role) => ({
      role: role.label,
      count: users.filter((user) => user.role === role.value).length
    }));
  }, [users]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: form.email,
        role: form.role,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'logs'), {
        type: 'USER_CREATE',
        message: `${form.email} kullanıcısı ${form.role} rolüyle oluşturuldu`,
        timestamp: serverTimestamp()
      });
      setMessage('Çalışan başarıyla oluşturuldu.');
      setForm({ email: '', password: '', role: 'production' });
    } catch (error) {
      console.error(error);
      setMessage('Kullanıcı oluşturulurken bir hata oluştu.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId, email) => {
    await deleteDoc(doc(db, 'users', userId));
    await addDoc(collection(db, 'logs'), {
      type: 'USER_DELETE',
      message: `${email} kullanıcısı silindi`,
      timestamp: serverTimestamp()
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Admin verileri yükleniyor" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-gray-900">Admin Yönetimi</h2>
        <p className="text-sm text-gray-500">Çalışan rollerini yönetin ve erişimleri kontrol edin.</p>
      </header>

      <section className="glass-card grid grid-cols-1 gap-6 rounded-3xl p-6 md:grid-cols-3">
        {roleCounts.map((item) => (
          <div key={item.role} className="rounded-2xl bg-white/70 p-5 text-center shadow-sm">
            <p className="text-xs uppercase text-gray-400">{item.role}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">{item.count}</p>
          </div>
        ))}
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-800">Çalışan Ekle</h3>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={handleCreate}>
          <input
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="E-posta"
            className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Geçici Şifre"
            className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
            required
          />
          <select
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3 text-sm focus:border-neon focus:outline-none"
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-neon px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
          >
            {creating ? 'Ekleniyor…' : 'Çalışanı Oluştur'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-orange-500">{message}</p>}
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-800">Çalışan Listesi</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-orange-100">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">E-posta</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Oluşturulma</th>
                <th className="px-6 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white/80">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-3 font-medium text-gray-700">{user.email}</td>
                  <td className="px-6 py-3 text-gray-500">{ROLES.find((role) => role.value === user.role)?.label}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'd MMM yyyy, HH:mm', { locale: tr }) : '-'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-800">Giriş Logları</h3>
        <div className="mt-4 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-2xl bg-white/70 p-4 text-sm text-gray-600">
              <p>{log.message}</p>
              <span className="text-xs text-gray-400">
                {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'd MMM yyyy, HH:mm', { locale: tr }) : '-'}
              </span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400">Kayıt bulunamadı.</p>}
        </div>
      </section>
    </div>
  );
}
