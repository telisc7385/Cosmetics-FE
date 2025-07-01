export interface BannerType {
  id: number;
  sequence_number: number;
  heading: string;
  subheading: string;
  subheading2?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  mobile_banner?: string;
  publicId?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
}
