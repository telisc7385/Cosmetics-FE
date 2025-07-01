// types/address.ts
 
export type AddressType = "SHIPPING" | "BILLING" | "BOTH";
 
export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine: string;
  landmark?: string;
  type: AddressType;
}
 
// ✅ Add this to fix the import error
export interface AddressApiResponse {
  address: Address[];
}