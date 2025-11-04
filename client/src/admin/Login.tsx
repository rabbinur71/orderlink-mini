import React, { useState } from 'react';
import api from '../api';
import { setToken } from './auth';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('StrongPass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      const token = res.data.token;
      setToken(token);
      navigate('/admin/orders');
    } catch (err) {
      console.error(err);
      // Type-safe access to error properties
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-md surface p-6'>
        <h2 className='text-xl font-semibold mb-4'>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <label className='block text-sm mb-1'>Email</label>
          <input className='input w-full mb-3' value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className='block text-sm mb-1'>Password</label>
          <input
            type='password'
            className='input w-full mb-3'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className='flex gap-2'>
            <button className='px-4 py-2 bg-blue-600 rounded' disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
          {error && <div className='text-red-400 mt-3'>{error}</div>}
        </form>
      </div>
    </div>
  );
}