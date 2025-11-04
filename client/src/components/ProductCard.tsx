import React from 'react';

type Props = {
  title: string;
  image_url?: string | null;
  priceCents: number;
  currency?: string;
  description?: string | null;
};

export default function ProductCard({ title, image_url, priceCents, currency = 'BDT', description }: Props) {
  return (
    <div className='surface p-4 rounded-lg shadow-md'>
      <div className='flex gap-4'>
        <div className='w-28 h-28 flex-shrink-0 bg-gray-900 rounded-md overflow-hidden'>
          {image_url ? (
            <img src={image_url} alt={title} className='w-full h-full object-cover' />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-sm text-zinc-400'>No image</div>
          )}
        </div>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <p className='text-sm text-zinc-300 mt-1'>{description}</p>
          <div className='mt-3 font-mono text-sm'>{(priceCents / 100).toFixed(2)} {currency}</div>
        </div>
      </div>
    </div>
  );
}