import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MiniOrder from './pages/MiniOrder';
import Tracker from './pages/Tracker';
import AdminLogin from './admin/Login';
import AdminOrders from './admin/Orders';

function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-md w-full p-6 surface'>
        <h1 className='text-2xl mb-4'>ORDERLINK-MINI</h1>
        <p className='text-sm text-zinc-300 mb-4'>Mini order demo — open /o/:slug to place orders</p>
        <div className='flex gap-2'>
          <a href='/o/sample-product' className='px-3 py-2 rounded bg-blue-600'>Open sample product</a>
          <a href='/admin/login' className='px-3 py-2 rounded bg-zinc-700'>Admin</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/o/:slug' element={<MiniOrder />} />
        <Route path='/t/:invoice' element={<Tracker />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/orders' element={<AdminOrders />} />
      </Routes>
    </BrowserRouter>
  );
}