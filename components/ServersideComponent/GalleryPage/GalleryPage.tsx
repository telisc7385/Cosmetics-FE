import Gallery from "@/components/ClientsideComponent/Gallery/Gallery";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { GalleryImage } from "@/types/gallery";

export const dynamic = "force-dynamic"; // ensures fresh data, disables caching

type Props = {
  gallery: GalleryImage[];
};

const GalleryPage = async ({ gallery }: Props) => {
  // This ensures that if 'gallery' is null or undefined, 'images' defaults to an empty array,
  // preventing the 'map' error in the Gallery component.
  const images = (gallery || []).filter((img) => img.is_active);

  return (
    // --- CHANGE MADE HERE: Adjusted px for responsive padding ---
    // px-4 for mobile (default), md:px-[40px] for tablet and laptop.
    <div className="h-auto bg-white px-4 md:px-[40px] max-w-[84rem] mx-auto">
      <SectionHeader
        title="Our Gallery"
        subtitle="A glimpse into beauty, confidence, and satisfaction."
      />
      <Gallery images={images} />
    </div>
  );
};

export default GalleryPage;
