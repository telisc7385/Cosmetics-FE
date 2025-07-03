export const dynamic = 'force-dynamic';
import React from 'react';
import ShopPageClient from '@/components/ClientsideComponent/shopPageClient/shopPageClient';
import { fetchCategories } from '@/api/fetchCategories';
import { fetchProducts } from '@/api/fetchProduct';

export default async function ShopPage() {
  const { categories } = await fetchCategories();
  const { products } = await fetchProducts(); 
  return (
    <div className=" mb-5">
   <ShopPageClient categories={categories} products={products}/>
    </div>
  );
}