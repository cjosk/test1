'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Loader from './Loader';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signOut: () => signOut(auth)
    }),
    [user]
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader label="Neon1 ERP yükleniyor" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-200">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-md space-y-6 p-10 text-center shadow-glass"
      >
        <h1 className="text-2xl font-semibold text-neon">Neon1 ERP Giriş</h1>
        <p className="text-sm text-gray-500">Yönetim paneline erişmek için hesap bilgilerinizi girin.</p>
        <div className="space-y-4">
          <div className="text-left">
            <label className="mb-2 block text-sm font-medium">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white/70 p-3 text-sm focus:border-neon focus:outline-none"
              required
            />
          </div>
          <div className="text-left">
            <label className="mb-2 block text-sm font-medium">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white/70 p-3 text-sm focus:border-neon focus:outline-none"
              required
            />
          </div>
        </div>
        {error && <p className="rounded-md bg-red-100 p-2 text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neon px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
}
