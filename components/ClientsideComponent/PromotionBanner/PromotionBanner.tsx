// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { X } from "lucide-react";

// const PromotionBanner = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const bannerImage: string = "/promobanner.jpg";
//   const [countdown, setCountdown] = useState<string>("");

//   const calculateCountdown = () => {
//     // Corrected the 8 days calculation: 8 * 24 * 60 * 60 * 1000
//     const eightDaysInMs = 8 * 24 * 60 * 60 * 1000;
//     const launchTime = localStorage.getItem("bannerLaunchTime");
//     let startTime: number;

//     if (launchTime) {
//       startTime = parseInt(launchTime, 10);
//     } else {
//       startTime = Date.now();
//       localStorage.setItem("bannerLaunchTime", startTime.toString());
//     }

//     const endTime = startTime + eightDaysInMs;
//     const now = Date.now();
//     const timeLeft = endTime - now;

//     if (timeLeft <= 0) {
//       return "00 | 00 | 00 | 00";
//     }

//     const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
//     const hours = Math.floor(
//       (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
//     );
//     const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

//     const formatTime = (num: number) => num.toString().padStart(2, "0");

//     return `${formatTime(days)} | ${formatTime(hours)} | ${formatTime(
//       minutes
//     )} | ${formatTime(seconds)}`;
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, 10000);

//     const countdownInterval = setInterval(() => {
//       setCountdown(calculateCountdown());
//     }, 1000);

//     return () => {
//       clearTimeout(timer);
//       clearInterval(countdownInterval);
//     };
//   }, []);

//   useEffect(() => {
//     if (isVisible) {
//       setCountdown(calculateCountdown());
//     }
//   }, [isVisible]);

//   const handleClose = () => {
//     setIsVisible(false);
//   };

//   if (!isVisible) {
//     return null;
//   }

//   return (
//     <div
//       className={`fixed bottom-4 right-4 w-80 md:w-96 lg:w-112
//         transition-transform duration-700 ease-out transform
//         ${
//           isVisible
//             ? "translate-x-0 translate-y-0"
//             : "translate-x-full translate-y-full"
//         }
//         z-50`}
//     >
//       <button
//         onClick={handleClose}
//         className="absolute -top-2 -left-2 bg-black bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-90 transition-colors z-50 shadow-md hover:cursor-pointer"
//         aria-label="Close banner"
//       >
//         <X size={18} />
//       </button>

//       <div
//         className="bg-white rounded-lg shadow-xl overflow-hidden"
//         style={{
//           backgroundImage: `url(${bannerImage})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundRepeat: "no-repeat",
//         }}
//       >
//         <div className="relative p-4 text-white flex flex-col justify-between h-full min-h-[240px]">
//           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>

//           <div className="relative z-10 flex flex-col justify-end h-full mt-2">
//             <p className="text-sm font-medium mb-1">Limited Time Offer!</p>
//             <h3 className="text-xl font-bold mb-2">Exclusive Discount</h3>
//             <p className="text-xs">Grab your favorites before time runs out.</p>

//             {/* Updated Countdown Display */}
//             <div className="mt-4 flex items-center self-start gap-x-4 mb-3">
//               {" "}
//               {/* Changed classes here */}
//               {countdown.split(" | ").map((timePart, index, arr) => (
//                 <React.Fragment key={index}>
//                   <div className="flex flex-col items-center">
//                     {" "}
//                     {/* Removed flex-1 */}
//                     <span className="text-xl md:text-2xl font-bold text-white leading-none">
//                       {timePart}
//                     </span>
//                     <span className="text-xs uppercase mt-1 text-gray-300">
//                       {index === 0
//                         ? "Days"
//                         : index === 1
//                         ? "Hours"
//                         : index === 2
//                         ? "Minutes"
//                         : "Seconds"}
//                     </span>
//                   </div>
//                   {/* Add divider if it's not the last item */}
//                   {index < arr.length - 1 && (
//                     <span className="h-6 w-px bg-gray-300 mx-1"></span>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>

//             <Link href="/shop" passHref>
//               <button
//                 style={{ backgroundColor: "#203b67" }}
//                 className="mt-4 px-4 py-1 text-white font-semibold rounded-md shadow-lg
//                            focus:outline-none focus:ring-2 focus:ring-[#203b67] focus:ring-offset-2
//                            self-start"
//               >
//                 Shop Now
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PromotionBanner;
