'use client';

import { subscribeToNewsletter } from '@/components/ServersideComponent/NewsletterAction/NewsletterAction';
import { RootState } from '@/store/store';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';


export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Extract token from Redux
  const token = useSelector((state: RootState) => state.auth.token); // adjust `auth.token` based on your slice

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // if (!token) {
    //   toast.error('Authentication token not found');
    //   setIsSubmitting(false);
    //   return;
    // }

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
