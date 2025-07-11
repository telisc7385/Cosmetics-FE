// types/auth.ts

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  imageUrl: string | null; // Ensures imageUrl can be a string or null
  bio: string | null;      // Ensures bio can be a string or null
  role: string;
}

export interface AuthCustomer {
  id: number;
  email: string;
  firstName: string;   // Made non-optional for consistent display
  lastName: string;    // Made non-optional for consistent display
  imageUrl: string | null; // Explicitly string or null for profile picture URL
  phone: string;       // Non-optional as per typical user data
  role: string;        // Non-optional as per typical user data
  bio: string | null;  // Explicitly string or null for bio
  username?: string;   // Optional if you have it
}