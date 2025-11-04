import React, { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

type ProductSnapshot = {
  id: string;
  title: string;
  description?: string | null;
  price_cents: number;
  currency?: string;
  image_url?: string | null;
  slug: string;
};

export default function MiniOrder() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/o/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.error || 'Failed to load product');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function validate() {
    if (!name.trim()) return 'Please enter your name';
    if (!phone.trim()) return 'Please enter your phone number';
    if (!product) return 'Product not loaded';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        product_id: product!.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        qty
      };
      const res = await api.post('/orders', payload);
      const invoice = res.data.invoice_id;
      // navigate to tracker page with invoice id
      navigate(`/t/${invoice}`);
    } catch (err) {
    console.error('order submit error', err);
    if (err instanceof Error) {
      // Handle generic JS error
      setError(err.message || 'Failed to submit order');
    } else if (err && typeof err === 'object' && 'response' in err) {
      // Handle Axios error
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error || 'Failed to submit order');
    } else {
      setError('Failed to submit order');
    }
  } finally {
    setSubmitting(false);
  }
}

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-sm text-zinc-400'>Loading product…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen p-4'>
        <div className='max-w-md mx-auto'>
          <div className='surface p-4'>
            <div className='text-red-400 mb-2'>Error: {error}</div>
            <a href='/' className='underline'>Back to home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-md mx-auto'>
        <div className='mb-4'>
          <ProductCard
            title={product!.title}
            image_url={product!.image_url}
            priceCents={product!.price_cents}
            currency={product!.currency}
            description={product!.description}
          />
        </div>

        <form className='surface p-4' onSubmit={handleSubmit}>
          <h3 className='text-lg font-semibold mb-3'>Place your order</h3>

          <label className='block text-sm mb-1'>Name</label>
          <input className='input w-full mb-3' value={name} onChange={(e) => setName(e.target.value)} />

          <label className='block text-sm mb-1'>Phone</label>
          <input className='input w-full mb-3' value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className='block text-sm mb-1'>Address (optional)</label>
          <textarea className='input w-full mb-3' rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />

          <label className='block text-sm mb-1'>Quantity</label>
          <input type='number' min={1} className='input w-28 mb-4' value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />

          <div className='flex gap-2'>
            <button type='submit' className='px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60' disabled={submitting}>
              {submitting ? 'Placing…' : 'Place Order'}
            </button>
            <button type='button' className='px-4 py-2 rounded-md border border-zinc-700' onClick={() => { setName(''); setPhone(''); setAddress(''); setQty(1); }}>
              Reset
            </button>
          </div>

          {error && <div className='text-red-400 mt-3'>{error}</div>}
        </form>
      </div>
    </div>
  );
}