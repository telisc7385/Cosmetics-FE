'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex   bg-gray-100  ">
        {/* Left - Form Section */}
        <div className="w-full md:w-full  sm:p-4">
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowLogin(true)}
              className={`px-4 py-2 rounded-l font-medium  cursor-pointer ${
                showLogin ? 'bg-[#8000ff] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`px-4 py-2 rounded-r font-medium cursor-pointer ${
                !showLogin ? 'bg-[#8000ff] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showLogin ? 'login' : 'register'}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {showLogin ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </div>

      {/* </div> */}
    </div>
  );
}
