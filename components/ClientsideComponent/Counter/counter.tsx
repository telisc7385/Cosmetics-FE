"use client";

import { useEffect, useState } from "react";
import { fetchHomepageStats } from "@/api/fetchStats";
import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
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
    <section ref={ref} className="relative w-full py-10 md:py-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/counterbg.jpg"
          alt="Counter Background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px] z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto p-4">
        <SectionHeader
          title="Our Achievement"
          subtitle="Track how we've grown over time."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <StatItem key={index} number={stat.number} title={stat.title} />
          ))}
        </div>
      </div>
    </section>
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
      className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 transition-transform hover:scale-105 transform duration-300 hover:shadow-2xl"
    >
      <span className="text-3xl sm:text-5xl font-extrabold text-[#10626B] mb-2 block">
        {count}+
      </span>
      <p className="text-sm sm:text-base font-medium text-gray-900 uppercase tracking-wide">
        {title}
      </p>
    </motion.div>
  );
};

export default Counter;
