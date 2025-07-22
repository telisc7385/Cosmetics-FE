import { getStoreLocatorData } from "@/api/storeLocatorApi";
import StoreLocator from "@/components/StoreLocator/StoreLocator";
import Image from "next/image";

const StoreLocatorPage = async () => {
  const storeItems = await getStoreLocatorData();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner with heading */}

      <div className="w-full h-[300px] sm:h-[400px] md:h-[400px] flex items-center justify-center relative mt-4">
        <Image
          src="/testimonialbg.png"
          alt="store Banner"
          layout="fill"
          objectFit="cover"
          className="absolute"
        />
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 md:px-16">
            <div className="text-black text-center">
              <h2
                className={`text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md transition-opacity duration-500`}
              >
                Find Your Glow Near You
              </h2>
            </div>
          </div>
        </div>

        {/* <h2 className="text-white text-4xl lg:text-6xl md:text-2xl font-extrabold z-10">{BannerData?.heading}</h2> */}
      </div>

      <div className="max-w-7xl mx-auto py-8 md:px-4">
        <StoreLocator storeItems={storeItems} />
      </div>
    </div>
  );
};

export default StoreLocatorPage;
