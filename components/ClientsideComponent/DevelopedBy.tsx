"use client";

import Image from "next/image";

const DevelopedByDermatologists = () => {
  return (
    <section className="bg-[#fdf7f0] py-12 px-4 md:px-8 lg:px-16 md:mt-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* ===== Text Section (Shown First on Mobile Only) ===== */}
        <div className="block md:hidden w-full mb-4">
          <p className="text-sm uppercase tracking-widest text-gray-600 mb-2">
            How We Make
          </p>
          <h2 className="text-2xl font-bold text-[#1e1e1e]">
            Developed by professional dermatologists
          </h2>
        </div>

        {/* ===== Left Image ===== */}
        <div className="w-full md:w-1/2 flex justify-center ">
          <div className="relative w-[80%] max-w-xs sm:max-w-sm md:max-w-md -mt-4">
            <Image
              src="/developedBy.png"
              alt="Line art face illustration"
              width={500}
              height={500}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* ===== Right Content ===== */}
        <div className="w-full md:w-1/2">
          {/* Text only for md+ screens */}
          <div className="hidden md:block">
            <p className="text-sm uppercase tracking-widest text-gray-600 mb-2">
              How We Make
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e1e1e] mb-4">
              Developed by professional dermatologists
            </h2>
          </div>

          <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed">
            Cras dictum odio sed aliquam eleifend. Lorem ipsum dolor sit amet,
            consecte adipiscing elit. Etiam lorem lectus Pellentesque lacinia
            sollicitudin luctus Phas pretium porta odio a porta. Cras fringilla
            iaculis tellus, sit amet efficitur libero non. Aliquam erat
            volutpat. Ut at sagittis nunc. In vitae tempus lectus. Nulla apien
            accumsan, aliquam ex ac, vulputate nisi. Curabitur sit amet arcu ut
            mauris commodo sagittis. In lacinia congue nulla, non suscipit dui
            gravida id Maecen euismod, elit at semper dictum, velit leo bibendum
            ipsum, in viverra risus ex.
          </p>

          {/* Opening Hours and Contact */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-16 lg:gap-30 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-lg lg:text-2xl text-[#1e1e1e] mb-2">
                We are Open
              </h4>
              <p className="text-sm text-gray-700">Mon – Fri: 08:30 – 20:00</p>
              <p className="text-sm text-gray-700">Sat & Sun: 09:30 – 21:30</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg lg:text-2xl text-[#1e1e1e] mb-2">
                Contact Us
              </h4>
              <p className="text-sm text-gray-700">contact@example.com</p>
              <p className="text-sm text-gray-700">+01 23456789</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-2 px-6 py-3 bg-[#f2e3c3] hover:bg-[#e8dbc0] text-[#1e1e1e] text-sm tracking-widest uppercase rounded transition-all duration-300">
            Explore Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default DevelopedByDermatologists;
