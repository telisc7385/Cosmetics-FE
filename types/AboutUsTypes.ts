type ComponentItem = {
  id: number;
  sequence_number: number;
  heading: string;
  sub_heading: string;
  description: string;
  image: string;
  precentage: string;
};

export type SectionDataItems = {
  id: number;
  sequence_number: number;
  section_name: string;
  heading: string;
  sub_heading: string;
  description: string;
  image: string;
  components: ComponentItem[];
};
