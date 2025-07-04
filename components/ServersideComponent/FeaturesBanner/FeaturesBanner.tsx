import Image from "next/image";

interface Feature {
  src: string;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    src: "/shipping.svg",
    title: "Free Shipping",
    desc: "On Orders Above ₹499",
  },
  {
    src: "/easyreturn.svg",
    title: "Easy Returns",
    desc: "15-Day Return Policy",
  },
  {
    src: "/authenticate.svg",
    title: "100% Authentic",
    desc: "Products Sourced Directly",
  },
];

const extraSection = {
  title: "Secure Payments",
  desc: "100% Payment Protection | Multiple Payment Modes",
  icon: "/secure3.png", // Add your own icon here
};

const FeaturesBanner = () => {
  return (
    <div className="bg-gradient-to-r from-[#1d3b60] to-purple-400 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {features.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 w-full md:w-auto"
          >
            <div className="bg-white rounded-full p-2">
              <Image src={item.src} alt={item.title} width={30} height={30} />
            </div>
            <div>
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm">{item.desc}</p>
            </div>
          </div>
        ))}

        {/* ✅ Replaced Social Icons Section with New Section */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-white rounded-full p-2">
            <Image
              src={extraSection.icon}
              alt={extraSection.title}
              width={30}
              height={30}
            />
          </div>
          <div>
            <h4 className="font-semibold">{extraSection.title}</h4>
            <p className="text-sm">{extraSection.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesBanner;
