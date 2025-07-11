// import SectionHeader from "@/components/CommonComponents/SectionHeader";
// import { WhyChooseUsItem } from "@/types/whyChooseUs";
// import Image from "next/image";

// type Props = {
//   whyChooseItems: WhyChooseUsItem[];
// };

// export default async function WhyChooseUs({ whyChooseItems }: Props) {
//   return (
//     <div className="w-full py-5 px-[40px]">
//       {/* --- CHANGE MADE HERE: Changed 'container mx-auto' to 'max-w-[84rem] mx-auto' --- */}
//       <div className="max-w-[84rem] mx-auto my-14">
//         <SectionHeader
//           title="Why Choose Us"
//           subtitle="Trusted by Thousands, Loved for a Reason."
//         />
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {whyChooseItems.slice(0, 3).map(
//             (
//               item // ✅ only first 3
//             ) => (
//               <div
//                 key={item.id}
//                 className="bg-[#f9fafb] rounded-xl shadow p-6 flex flex-col items-center text-center group"
//               >
//                 {item.image ? (
//                   <div className="w-[60px] h-[60px] mb-4 image-rotate-once">
//                     <Image
//                       src={item.image}
//                       alt={item.heading}
//                       width={60}
//                       height={60}
//                       className="w-full h-full object-contain"
//                     />
//                   </div>
//                 ) : (
//                   <div className="w-[60px] h-[60px] bg-gray-300 rounded-full flex items-center justify-center mb-4 text-sm text-white">
//                     No Image
//                   </div>
//                 )}
//                 <h4 className="text-lg font-semibold mb-2">{item.heading}</h4>
//                 <p className="text-gray-600">{item.description}</p>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
