import React, { useEffect, useState } from 'react';
import api from '../api';
import OrderRow from './OrderRow';
import { setToken, getToken } from './auth';
import { useNavigate } from 'react-router-dom';

// Define the Order type (must match your backend response)
interface ProductSnapshot {
  title: string;
  // add other fields if needed: description, price_cents, etc.
}

interface Order {
  id: string;
  invoice_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  qty: number;
  status: string;
  product_snapshot: ProductSnapshot | null;
  created_at: string;
  updated_at: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ orders: Order[] }>('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      const message =
        (err as { response?: { data?: { error?: string }; status?: number } })?.response?.data?.error ||
        'Failed to load orders';
      const status = (err as { response?: { status?: number } })?.response?.status;

      setError(message);
      if (status === 401) {
        setToken(null);
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      fetchOrders(); // optimistic refetch
    } catch (err) {
      console.error('status change error', err);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to update status';
      setError(message);
    }
  }

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div>Loading…</div>
      </div>
    );

  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Orders</h2>
          <div>
            <button className='px-3 py-1 rounded bg-zinc-700 mr-2' onClick={fetchOrders}>
              Refresh
            </button>
            <button
              className='px-3 py-1 rounded bg-red-600'
              onClick={() => {
                setToken(null);
                navigate('/admin/login');
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {error && <div className='text-red-400 mb-3'>{error}</div>}

        {orders.length === 0 && <div className='surface p-4'>No orders found</div>}

        {orders.map((o) => (
          <OrderRow key={o.id} order={o} onChangeStatus={handleChangeStatus} />
        ))}
      </div>
    </div>
  );
}