import React from 'react';
import ShopPageClient from '@/components/ClientsideComponent/shopPageClient/shopPageClient';
import { fetchCategories } from '@/api/fetchCategories';
import { fetchProducts } from '@/api/fetchProduct';

export default async function ShopPage() {
  const { categories } = await fetchCategories();
  const { products } = await fetchProducts(); 
  return (
    <div className="">
   <ShopPageClient categories={categories} products={products}/>
    </div>
  );
}