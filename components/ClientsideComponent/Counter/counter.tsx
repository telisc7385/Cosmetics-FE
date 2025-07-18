"use client";

import { useEffect, useState } from "react";
import { fetchHomepageStats } from "@/api/fetchStats";
import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import SectionHeader from "@/components/CommonComponents/SectionHeader";

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
    <div
      ref={ref}
      className="w-full my-10 rounded-xl px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Section header shown only once at top */}
      <div className="px-[20px] mt-2 max-w-7xl mx-auto mb-8 text-center">
        <SectionHeader
          title="Shop Our Best Sellers"
          subtitle="Trusted by Thousands, Loved for a Reason."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-6 text-center relative">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center"
          >
            <StatItem number={stat.number} title={stat.title} />

            {/* Desktop vertical divider */}
            {index !== stats.length - 1 && (
              <div className="hidden lg:block absolute right-[-4px] top-1/2 transform -translate-y-1/2 h-12 w-[2px] bg-gradient-to-b from-[#10626B] via-[#50A1A8] to-[#10626B] rounded-full" />
            )}

            {/* Mobile divider logic (only when 2 items per row) */}
            {index % 2 === 0 && index + 1 < stats.length && (
              <>
                {/* Vertical divider between 2 columns (keep only this for mobile) */}
                <div className="block lg:hidden absolute top-1/2 -translate-y-1/2 right-0 h-10 w-[2px] bg-gradient-to-b from-[#10626B] via-[#50A1A8] to-[#10626B] rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({ number, title }: { number: number; title: string }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const duration = 2.5;

  useEffect(() => {
    if (number) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { delay: 0.2, duration: 0.5 },
      });

      let start = 0;
      const end = number;
      const increment = Math.ceil(end / (duration * 60));
      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 1000 / 60);

      return () => clearInterval(interval);
    }
  }, [number, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      className="flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <span className="text-3xl sm:text-5xl font-extrabold text-[#10626B] mb-1 leading-none">
        {count}
      </span>
      <p className="text-sm sm:text-base font-medium text-gray-800 uppercase tracking-wide">
        {title}
      </p>
    </motion.div>
  );
};

export default Counter;
