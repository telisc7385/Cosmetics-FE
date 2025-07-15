// api/GoogleAnalyticsApi.ts
import { apiCore } from './ApiCore'; // Apni apiCore file ka sahi path dein

interface GoogleAnalyticsSetting {
  id: number;
  google_email: string;
  tag: string;
  measurement_id: string; // Ye humara GA4 Measurement ID hai
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

interface GoogleAnalyticsApiResponse {
  success: boolean;
  result: GoogleAnalyticsSetting[];
}

export async function getGoogleAnalyticsSettings(token: string | null = null): Promise<GoogleAnalyticsApiResponse | undefined> {
  try {
    const response = await apiCore<GoogleAnalyticsApiResponse>(
      'google-analytics', // Aapka backend endpoint path
      'GET',
      undefined, // GET request mein body nahi hota
      token // Ab token ko yahan pass karein
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch Google Analytics settings:", error);
    return undefined;
  }
}