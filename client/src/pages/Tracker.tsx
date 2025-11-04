import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Tracker() {
  const { invoice } = useParams<{ invoice: string }>();
  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-md mx-auto'>
        <div className='surface p-6 text-center'>
          <h2 className='text-xl font-semibold mb-2'>Order tracking</h2>
          <p className='text-sm text-zinc-300 mb-4'>Your order was placed successfully.</p>
          <div className='bg-black/30 p-3 rounded mb-4 font-mono'>{invoice}</div>
          <p className='text-sm mb-4'>Tracking and status updates will appear here in next iterations.</p>
          <Link to='/' className='underline'>Back to home</Link>
        </div>
      </div>
    </div>
  );
}