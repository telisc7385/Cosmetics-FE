// 'use client';

// import { subscribeToNewsletter } from '@/components/ServersideComponent/NewsletterAction/NewsletterAction';
// import { useState } from 'react';


// export default function NewsletterSignup() {
//   const [email, setEmail] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSuccessMsg('');
//     setErrorMsg('');
//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append('email', email);

//     const res = await subscribeToNewsletter(formData);

//     if (res.success) {
//       setSuccessMsg(res.message);
//       setEmail('');
//     } else {
//       setErrorMsg(res.message);
//     }

//     setIsSubmitting(false);
//   };

//   return (
//     <section className="bg-[#1d3f63] text-[#f3f6f7] py-12 px-4 text-center">
//   <div className="max-w-2xl mx-auto">
//     <h2 className="text-3xl font-bold mb-4">
//       Join Our <span className="text-[#1abc9c]">Newsletter</span> Now {/* Accent color applied here */}
//     </h2>

//     <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
//       <input
//         type="email"
//         name="email"
//         required
//         placeholder="Enter Your Email"
//         className="px-4 py-2 rounded-md bg-white text-gray-800 w-full sm:w-2/3"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <button
//         type="submit"
//         // Accent color for button background, adjust hover color accordingly
//         className="bg-[#1abc9c] hover:bg-[#15a78c] text-[#f3f6f7] px-6 py-2 rounded-md"
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? 'Subscribing...' : 'Subscribe'}
//       </button>
//     </form>

//     {/* Message colors can remain Tailwind defaults or use your theme colors */}
//     {successMsg && <p className="text-green-400 mt-4">{successMsg}</p>}
//     {errorMsg && <p className="text-red-400 mt-4">{errorMsg}</p>}
//   </div>
// </section>
//   );
// }



// 'use client';

// import { subscribeToNewsletter } from '@/components/ServersideComponent/NewsletterAction/NewsletterAction';
// import { useState } from 'react';


// export default function NewsletterSignup() {
//   const [email, setEmail] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSuccessMsg('');
//     setErrorMsg('');
//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append('email', email);

//     const res = await subscribeToNewsletter(formData);

//     if (res.success) {
//       setSuccessMsg(res.message);
//       setEmail('');
//     } else {
//       setErrorMsg(res.message);
//     }

//     setIsSubmitting(false);
//   };

//   return (
//     // Section background: Your Deep Blue | Text color: Your Very Light Gray
//     <section className="bg-[#1d3f63] text-[#f3f6f7] py-12 px-4 text-center">
//       <div className="max-w-2xl mx-auto">
//         <h2 className="text-3xl font-bold mb-4">
//           Join Our <span className="text-[#9b59b6]">Newsletter</span> Now {/* Accent: Violet */}
//         </h2>

//         <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
//           <input
//             type="email"
//             name="email"
//             required
//             placeholder="Enter Your Email"
//             // Input background: White | Input text: Dark Gray
//             className="px-4 py-2 rounded-md bg-white text-gray-800 w-full sm:w-2/3"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <button
//             type="submit"
//             // Button background: Violet | Button text: Light Gray/White | Hover: Darker Violet
//             className="bg-[#9b59b6] hover:bg-[#8e44ad] text-[#f3f6f7] px-6 py-2 rounded-md"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Subscribing...' : 'Subscribe'}
//           </button>
//         </form>

//         {/* Success/Error messages can retain default Tailwind green/red or be customized */}
//         {successMsg && <p className="text-green-400 mt-4">{successMsg}</p>}
//         {errorMsg && <p className="text-red-400 mt-4">{errorMsg}</p>}
//       </div>
//     </section>
//   );
// }



'use client';

import { subscribeToNewsletter } from '@/components/ServersideComponent/NewsletterAction/NewsletterAction';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('email', email);

    const res = await subscribeToNewsletter(formData);

    if (res.success) {
      toast.success(res.message); 
      setEmail('');
    } else {
      toast.error(res.message); 
    }

    setIsSubmitting(false);
  };

  return (
    <section className="bg-[#1d3f63] text-[#f3f6f7] py-12 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Join Our <span className="text-[#9b59b6]">Newsletter</span> Now
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            name="email"
            required
            placeholder="Enter Your Email"
            className="px-4 py-2 rounded-md bg-white text-gray-800 w-full sm:w-2/3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#9b59b6] hover:bg-[#8e44ad] text-[#f3f6f7] px-6 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
