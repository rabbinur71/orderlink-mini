import React from 'react';

interface ProductSnapshot {
  title: string;
  // add other fields if used: description, price_cents, etc.
}

interface Order {
  id: string;
  invoice_id: string;
  customer_name: string;
  customer_phone: string;
  qty: number;
  status: string;
  product_snapshot: ProductSnapshot | null;
}

type Props = {
  order: Order;
  onChangeStatus: (id: string, status: string) => void;
};

export default function OrderRow({ order, onChangeStatus }: Props) {
  return (
    <div className='surface p-3 rounded mb-3'>
      <div className='flex justify-between items-start'>
        <div>
          <div className='font-mono text-sm text-zinc-400'>#{order.invoice_id}</div>
          <div className='font-semibold'>{order.customer_name} — {order.customer_phone}</div>
          <div className='text-sm text-zinc-300'>
            {order.product_snapshot?.title} • Qty {order.qty}
          </div>
        </div>
        <div className='text-right'>
          <div className='text-sm mb-2'>
            Status: <span className='font-medium'>{order.status}</span>
          </div>
          <div className='flex flex-col gap-2'>
            <button
              className='px-3 py-1 rounded bg-yellow-600'
              onClick={() => onChangeStatus(order.id, 'processing')}
            >
              Processing
            </button>
            <button
              className='px-3 py-1 rounded bg-blue-600'
              onClick={() => onChangeStatus(order.id, 'shipped')}
            >
              Shipped
            </button>
            <button
              className='px-3 py-1 rounded bg-green-600'
              onClick={() => onChangeStatus(order.id, 'delivered')}
            >
              Delivered
            </button>
            <button
              className='px-3 py-1 rounded bg-red-600'
              onClick={() => onChangeStatus(order.id, 'cancelled')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}