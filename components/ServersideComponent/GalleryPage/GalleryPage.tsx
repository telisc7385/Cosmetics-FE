import Gallery from "@/components/ClientsideComponent/Gallery/Gallery";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { GalleryImage } from "@/types/gallery"; // Ensure this path is correct

export const dynamic = "force-dynamic"; // ensures fresh data, disables caching

type Props = {
  gallery?: GalleryImage[] | null; // Mark gallery as optional and potentially null
};

const GalleryPage = async ({ gallery }: Props) => {
  // Ensure gallery is an array before attempting to filter.
  // If gallery is null or undefined, default to an empty array.
  // Then, filter based on is_active.
  const images = (Array.isArray(gallery) ? gallery : []).filter(
    (img) => img.is_active
  );

  // Optional: Add a loading state or a message if no images are found
  if (images.length === 0) {
    return (
      <div className="h-auto bg-white px-4 md:px-[40px] max-w-7xl mx-auto text-center py-10">
        <SectionHeader
          title="Our Gallery"
          subtitle="A glimpse into beauty, confidence, and satisfaction."
        />
        <p className="text-gray-600 mt-5">
          No active gallery images found at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="h-auto bg-white px-4 md:px-[40px] max-w-7xl mx-auto">
      <SectionHeader
        title="Our Gallery"
        subtitle="A glimpse into beauty, confidence, and satisfaction."
      />
      <Gallery images={images} />
    </div>
  );
};

export default GalleryPage;
