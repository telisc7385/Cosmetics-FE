import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaPinterestP,
} from "react-icons/fa6";

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

        {/* Social Section */}
        {/* Social Section */}
        <div className="text-center mt-4 md:mt-0 md:text-left">
          <p className="font-semibold mb-2">Follow us on social media</p>
          <div className="flex justify-center md:justify-start gap-3">
            {/* Facebook */}
            <div className="group rounded-full bg-white p-2 transition duration-300 hover:bg-blue cursor-pointer">
              <FaFacebookF
                size={14}
                className="text-black group-hover:text-white transition"
              />
            </div>

            {/* Instagram */}
            <div className="group rounded-full bg-white p-2 transition duration-300 hover:bg-pink-500 cursor-pointer">
              <FaInstagram
                size={14}
                className="text-black group-hover:text-white transition"
              />
            </div>

            {/* Twitter/X */}
            <div className="group rounded-full bg-white p-2 transition duration-300 hover:bg-black cursor-pointer">
              <FaXTwitter
                size={14}
                className="text-black group-hover:text-white transition"
              />
            </div>

            {/* Pinterest */}
            <div className="group rounded-full bg-white p-2 transition duration-300 hover:bg-red-600 cursor-pointer">
              <FaPinterestP
                size={14}
                className="text-black group-hover:text-white transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesBanner;
