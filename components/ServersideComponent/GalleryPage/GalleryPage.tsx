// components/ServersideComponent/GalleryPage/GalleryPage.tsx

import Gallery from "@/components/ClientsideComponent/Gallery/Gallery";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { GalleryImage } from "@/types/gallery";

export const dynamic = "force-dynamic"; // ensures fresh data, disables caching

interface GalleryPageProps {
  gallery: GalleryImage[];
}

const GalleryPage = ({ gallery }: GalleryPageProps) => {
  const images = (Array.isArray(gallery) ? gallery : []).filter(
    (img) => img.is_active
  );

  if (images.length === 0) {
    return (
      <section className="w-full mt-4 md:mt-8 ">
        <div className="max-w-7xl mx-auto p-4">
          <SectionHeader
            title="Our Gallery"
            subtitle="A glimpse into beauty, confidence, and satisfaction."
            titleClass="text-2xl sm:text-3xl lg:text-4xl"
            subtitleClass="text-sm sm:text-base lg:text-lg"
          />
          <p className="text-gray-600 mt-5">
            No active gallery images found at the moment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mt-4 md:mt-8 ">
      <div className="max-w-7xl mx-auto p-4">
        <SectionHeader
          title="Our Gallery"
          subtitle="A glimpse into beauty, confidence, and satisfaction."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
        <Gallery images={images} />
      </div>
    </section>
  );
};

export default GalleryPage;
