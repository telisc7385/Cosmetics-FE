"use client";

import { SectionDataItems } from "@/types/AboutUsTypes";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  sectionData: SectionDataItems;
};

interface CounterItemProps {
  target: number;
  label: string;
  start: boolean;
}

const CounterItem: React.FC<CounterItemProps> = ({ target, label, start }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 2000;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const increment = target / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [start, target]);

  const display = count;

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-4xl sm:text-5xl font-bold text-[#213e5a]">
        {display}
        {label === "Happy Customers" ? ` CR+` : ``}
      </span>
      <p className="text-base sm:text-lg mt-2 text-gray-700">{label}</p>
    </div>
  );
};

const CounterComponent: React.FC<Props> = ({ sectionData }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
          {sectionData.components.map((item, idx) => (
            <div key={item.id || idx} className="py-4">
              <CounterItem
                target={Number(item.heading)}
                label={item.sub_heading}
                start={startAnimation}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterComponent;
