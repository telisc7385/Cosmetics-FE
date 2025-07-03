import { getProducts } from '@/api/fetchFeaturedSlider';
import React from 'react'
import FeaturedSlider from "@/components/ClientsideComponent/FeaturedSlider/FeaturedSlider";
import SectionHeader from '@/components/CommonComponents/SectionHeader';

export default async function FeaturedSliderComponent() {
  
  const product = await getProducts(); // server-side function
  

  return (
    <>
      <div className=' px-[40px]'>
      <SectionHeader 
  title="Shop Our Best Sellers" 
  subtitle="Trusted by Thousands, Loved for a Reason." 
/>
      </div>

        <FeaturedSlider products={product} />
    </>
  )
}
