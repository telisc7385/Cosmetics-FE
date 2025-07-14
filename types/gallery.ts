// src/types/gallery.ts
export interface GalleryImage {
  title: string;
  alt: string; // Used for the alt text
  id: number;
  sequence_number: string;
  image: string; // Used for the image source URL/path
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  section: string;
}