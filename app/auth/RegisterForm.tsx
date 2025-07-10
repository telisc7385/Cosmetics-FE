"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  redirectPath: string;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({
  redirectPath,
  onSwitchToLogin,
}: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    Bio: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) setErrors({ ...errors, image: "" });
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!imageFile) newErrors.image = "Please choose a profile picture";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.confirmPassword.trim())
      newErrors.confirmPassword = "Confirm Password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.Bio.trim()) newErrors.Bio = "Bio is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    if (step === 3) {
      try {
        const formData = new FormData();
        const profile = {
          firstName: form.firstName,
          lastName: form.lastName,
          bio: form.Bio,
        };
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("profile", JSON.stringify(profile));
        if (imageFile) formData.append("image", imageFile);

        toast.loading("Submitting...", { id: "register" });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || "Registration failed", {
            id: "register",
          });
          return;
        }

        const data = await res.json();
        toast.success("Registered successfully!", { id: "register" });
        console.log("Response:", data);
        onSwitchToLogin();
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Something went wrong", { id: "register" });
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="px-4 sm:px-6 md:px-0">
      <div className="w-full max-w-3xl mx-auto p-4 md:p-4 border-[1px] border-gray-300 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-3 text-[#213E5A] ">
          Create an Account!
        </h2>

        <div className="flex items-center justify-between mb-5 px-4">
          {["Personal Info", "Email Verify", "Bio"].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center text-white font-bold ${
                  step === idx + 1 ? "bg-[#214364]" : "bg-gray-300"
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-sm mt-1 text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block font-semibold mb-1 text-[#213E5A] ">
                  Personal Information :
                </label>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border cursor-pointer text-[#213E5A]  ${
                        errors.firstName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2 ">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleInputChange}
                      className={`w-full p-2 rounded border cursor-pointer text-[#213E5A]  ${
                        errors.lastName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#213E5A] ">
                  Profile Picture :
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full p-2 border rounded cursor-pointer text-[#213E5A]  ${
                    errors.image
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.image && (
                  <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                )}
              </div>
            </>
          )}

          {/* Step 2: Email + Password */}
          {step === 2 && (
            <>
              <div>
                <label className="block font-semibold text-[#213E5A] ">
                  Email Verification and Password :
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded cursor-pointer text-[#213E5A]  ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                    className={`w-full p-2 pr-10 rounded border cursor-pointer text-[#213E5A]  ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="w-1/2 relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 pr-10 rounded border cursor-pointer text-[#213E5A]  ${
                      errors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Bio */}
          {step === 3 && (
            <div>
              <label className="block font-semibold mb-1 text-[#213E5A] ">
                Bio :
              </label>
              <textarea
                name="Bio"
                placeholder="Enter your bio"
                value={form.Bio}
                onChange={handleInputChange}
                rows={4}
                className={`w-full p-2 border rounded resize-none cursor-pointer text-[#213E5A]  ${
                  errors.Bio ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.Bio && (
                <p className="text-sm text-red-500 mt-1">{errors.Bio}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="bg-[#214364] hover:bg-opacity-90 text-white font-semibold py-2 px-6 rounded cursor-pointer"
            >
              {step < 3 ? "Next" : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Login/Guest buttons section */}
      <div className="flex justify-center items-center gap-4 text-sm mt-6 sm:mt-4">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#214364] hover:underline font-medium cursor-pointer"
        >
          Already Registered? Login Here
        </button>
        <span className="text-gray-400">|</span>
        <button
          type="button"
          onClick={() => router.push(redirectPath)}
          className="text-gray-600 hover:underline font-medium cursor-pointer"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
