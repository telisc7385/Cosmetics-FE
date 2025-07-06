import Gallery from "@/components/ClientsideComponent/Gallery/Gallery";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { GalleryImage } from "@/types/gallery";

export const dynamic = "force-dynamic"; // ensures fresh data, disables caching

type Props = {
  gallery: GalleryImage[];
}

const GalleryPage = async ({gallery} : Props) => {

  const images = gallery.filter((img) => img.is_active);

  return (
    <div className="h-auto bg-white px-[40px] container mx-auto">
      <SectionHeader
        title="Our Gallery"
        subtitle="A glimpse into beauty, confidence, and satisfaction."
      />
      <Gallery images={images} />
    </div>
  );
};

export default GalleryPage;
