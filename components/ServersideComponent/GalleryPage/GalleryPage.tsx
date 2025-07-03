import Gallery from "@/components/ClientsideComponent/Gallery/Gallery";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { GalleryImage } from "@/types/gallery";

export const dynamic = "force-dynamic"; // ensures fresh data, disables caching


const GalleryPage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/gallery`, {
    cache: "no-store",
  });

  const data = await res.json();
  const allImages: GalleryImage[] = data.result || [];
  const images = allImages.filter((img) => img.is_active);

  return (
    <div className="h-auto bg-white px-[40px]">
      <SectionHeader
        title="Our Gallery"
        subtitle="A glimpse into beauty, confidence, and satisfaction."
      />
      <Gallery images={images} />
    </div>
  );
};

export default GalleryPage;
