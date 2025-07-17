export interface Store {
  id: number;
  name: string;
  email: string;
  phone_numbers: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  zipcode: number;
  latitude: string;
  longitude: string;
}

export interface StoresResponse {
  total_pages: number;
  current_page: number;
  page_size: number;
  stores: Store[];
}
