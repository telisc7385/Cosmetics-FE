import { getWhyChooseUs } from "@/api/fetchWhyChooseUs";
import SectionHeader from "@/components/CommonComponents/SectionHeader";


export default async function WhyChooseUs () {
  const items = await getWhyChooseUs();

  return (
    <div className="w-full  py-5 px-[40px] container mx-auto">
     
<SectionHeader 
  title="Why Choose Us" 
        subtitle="Trusted by Thousands, Loved for a Reason." 
/>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-[#f9fafb]  rounded-xl shadow ">
            <div className="p-3">

            <h4 className="text-lg font-semibold mb-2">{item.heading}</h4>
            <p className="text-gray-600 ">{item.description}</p>
            </div>
      
          </div>
        ))}
      </div>
    </div>
  );
};


