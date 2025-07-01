export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface AuthCustomer {
  imageUrl: any;
  lastName: string | undefined;
  id: number;
  name: string;
  email: string;
  phone: string;
  username?: string;
  firstName?: string;

}
