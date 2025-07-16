"use client";

import { useEffect, useState } from "react";
import { fetchHomepageStats } from "@/api/fetchStats";
import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

const Counter = () => {
  const [stats, setStats] = useState<{ title: string; number: number }[]>([]);
  const [startCount, setStartCount] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView && !startCount) {
      fetchHomepageStats().then((res) => {
        const filtered = res.filter((item) => item.is_active);
        const formatted = filtered.map((item) => ({
          title: item.title,
          number: item.number,
        }));
        setStats(formatted);
        setStartCount(true);
      });
    }
  }, [inView, startCount]);

  return (
    <div ref={ref} className="relative w-full my-10 overflow-hidden">
      {/* ✅ Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/counterbg.jpg"
          alt="Counter Background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#f7efe0] opacity-0 z-10" />
      </div>

      {/* ✅ Foreground Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 text-center">
          {stats.map((stat, index) => (
            <StatItem key={index} number={stat.number} title={stat.title} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ number, title }: { number: number; title: string }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const duration = 2.5; // seconds

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: { delay: 0.2 } });

    let start = 0;
    const end = number;
    const increment = Math.ceil(end / (duration * 60)); // 60 FPS
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 1000 / 60); // ~60fps

    return () => clearInterval(interval);
  }, [number, controls]); // ✅ FIX: added controls here

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      className="flex flex-col items-center justify-center"
    >
      <span className="text-4xl sm:text-5xl font-bold text-[#213e5a]">
        {count}
      </span>
      <p className="text-base sm:text-lg mt-2 text-gray-700">{title}</p>
    </motion.div>
  );
};

export default Counter;
