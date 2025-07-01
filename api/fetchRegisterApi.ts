import { apiCore } from "./ApiCore";
export async function registerUser(formData: FormData): Promise<string> {
  try {
    const response = await apiCore("/auth/register", "POST", formData);
    return typeof response === "string" ? response : JSON.stringify(response);
  } catch (error) {
    console.error("Registration error:", (error as Error).message);
    throw new Error((error as Error).message || "Registration failed");
  }
}
