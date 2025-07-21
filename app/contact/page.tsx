"use client";

import { useEffect, useState } from "react";
import { apiCore } from "@/api/ApiCore";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CompanySettings, CompanySettingsApiResponse } from "@/api/CompanyApi";
import animationData from "@/public/contact1.json";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

const countryStateMap: Record<string, string[]> = {
  India: ["Maharashtra", "Gujarat", "Delhi", "Karnataka", "Tamil Nadu"],
  USA: ["California", "Florida", "New York", "Texas", "Washington"],
  UK: ["England", "Scotland", "Wales", "Northern Ireland"],
};

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "set",
      targetId: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        form_name?: string;
        submitted_email?: string;
        submitted_subject?: string;
      }
    ) => void;
  }
}

export default function ContactFormSection() {
  const token = useAppSelector(selectToken);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone_number?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    city: "",
    state: "",
    country: "",
    subject: "",
    message: "",
  });

  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    if (formData.country) {
      setAvailableStates(countryStateMap[formData.country] || []);
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiCore<CompanySettingsApiResponse>(
          "/company-settings",
          "GET"
        );
        setCompany(res.result[0]);
      } catch {
        toast.error("Failed to fetch company info.");
      }
    };
    fetchCompany();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex for phone number: only digits, minimum 10 digits
    const phoneRegex = /^\d{10,}$/;

    if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Name should contain only letters and spaces";
    }

    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneRegex.test(formData.phone_number.trim())) {
      newErrors.phone_number =
        "Phone number must contain only numbers and be at least 10 digits long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await apiCore(
        "/connect/contact_form",
        "POST",
        formData,
        token || undefined
      );
      toast.success("Message sent successfully!");

      if (window.gtag) {
        window.gtag("event", "form_submission", {
          event_category: "Contact Form",
          event_label: "Message Sent Successfully",
          form_name: "ContactFormSection",
          submitted_email: formData.email,
          submitted_subject: formData.subject,
        });
      }

      setFormData({
        name: "",
        email: "",
        phone_number: "",
        city: "",
        state: "",
        country: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative w-full h-[200px] lg:h-[300px]">
        <Image
          src="/conactusbanner.png"
          alt="Contact Banner"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>

      <section className=" max-w-7xl mx-auto flex items-center justify-center bg-white px-4 py-10 sm:px-8 pb-6 relative">
        <div className="container mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-10 ">
          {/* Left: Form */}
          <div className="w-full lg:w-7/12 bg-white/80 backdrop-blur-md p-2 sm:p-4 rounded-2xl shadow-md border border-[#213e5a] h-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Contact Us
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[16px]"
            >
              <div className="flex flex-col col-span-1 sm:col-span-1">
                <input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
                />
                {errors.name && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="flex flex-col col-span-1 sm:col-span-1">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
                />
                {errors.email && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone number input with validation error display */}
              <div className="flex flex-col col-span-1 sm:col-span-1">
                <input
                  name="phone_number"
                  placeholder="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
                  // Added type="tel" for better mobile keyboard experience, though validation handles digits
                  type="tel"
                />
                {errors.phone_number && (
                  <span className="text-sm text-red-500 mt-1">
                    {errors.phone_number}
                  </span>
                )}
              </div>

              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
                className="border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
              />

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="border border-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white text-gray-600 w-full text-[16px]"
              >
                <option value="">Select Country</option>
                {Object.keys(countryStateMap).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={!formData.country}
                className="border border-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white text-gray-600 w-full text-[16px]"
              >
                <option value="">Select State</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <input
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="col-span-1 sm:col-span-2 border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
              />

              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="col-span-1 sm:col-span-2 border border-[#213E5A] text-[#213E5A] rounded-md px-2 py-1 sm:px-4 sm:py-2 bg-white"
              />

              <button
                type="submit"
                disabled={loading}
                className="col-span-1 sm:col-span-2 bg-[#213E5A] text-white font-semibold py-1 px-3 sm:py-2 sm:px-5 rounded border border-[#213E5A] hover:bg-white hover:text-[#213E5A] transition-all text-[16px]"
              >
                {loading ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>

          {/* Right: Info Section */}
          <div className="w-full lg:w-5/12 flex flex-col justify-between h-full">
            {company && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-2 bg-[#F3F6F7] rounded-2xl shadow-sm border border-gray-200 px-4 py-3 mb-2 text-[16px] lg:h-[230px]">
                <div className="flex flex-col sm:w-1/2 space-y-2 max-h-52 overflow-y-auto scrollbar-hide w-full">
                  <h3 className="text-md uppercase text-gray-500 font-semibold text-[17px] sm:text-[14px] text-center sm:text-left">
                    Contact Info
                  </h3>

                  {/* Mobile View */}
                  <div className="flex flex-col gap-2 sm:hidden">
                    <div className="flex justify-center gap-4 w-full text-center">
                      <div className="w-1/2">
                        <p className="font-bold text-[16px] text-[#213E5A]">
                          Address
                        </p>
                        <p className="text-sm text-[#213E5A]">
                          {company.address}
                        </p>
                      </div>
                      <div className="w-1/2">
                        <p className="font-bold text-[16px] text-[#213E5A]">
                          Call
                        </p>
                        {/* Made phone number clickable */}
                        <a
                          href={`tel:${company.phone}`}
                          className="text-sm text-[#213E5A] hover:underline"
                        >
                          {company.phone}
                        </a>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[16px] text-[#213E5A]">
                        Email
                      </p>
                      {/* Made email clickable */}
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm text-[#213E5A] hover:underline"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>

                  {/* Tablet/Laptop */}
                  <div className="hidden sm:block space-y-2">
                    <div>
                      <p className="font-bold text-[16px] text-[#213E5A]">
                        Address
                      </p>
                      <p className="text-sm text-[#213E5A]">
                        {company.address}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-[16px] text-[#213E5A]">
                        Email
                      </p>
                      {/* Made email clickable */}
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm text-[#213E5A] hover:underline"
                      >
                        {company.email}
                      </a>
                    </div>
                    <div className="lg:mb-0">
                      <p className="font-bold text-[16px] text-[#213E5A]">
                        Call
                      </p>
                      {/* Made phone number clickable */}
                      <a
                        href={`tel:${company.phone}`}
                        className="text-sm text-[#213E5A] hover:underline"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right: Lottie (desktop) / Map (mobile) */}
                <div className="w-full sm:w-1/2 flex justify-center items-center lg:pb-0">
                  <div className="w-full sm:hidden rounded-xl overflow-hidden border border-gray-300 mt-4">
                    {/* Changed from 'googleusercontent.com/maps.google.com/2' to a valid Google Maps embed URL example.
                      Replace 'YOUR_Maps_EMBED_URL' with your actual Google Maps embed URL.
                      This usually comes from embedding a map from Google Maps, which gives you an iframe src.
                      For example: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...`
                      The previous URL was likely a placeholder or incorrect.
                  */}
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.261298492022!2d73.9142750750275!3d18.562759982542564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c125642a8a89%3A0x6b4f74d0d02d338e!2sPhoenix%20Marketcity%2C%20Pune!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`}
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  <div className="hidden sm:block w-52 sm:w-52 lg:w-72 lg:h-60 lg:mb-0">
                    <Lottie
                      loop
                      play
                      animationData={animationData}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl shadow-md border border-gray-200 flex-1 hidden sm:block">
              {/* Changed from 'googleusercontent.com/maps.google.com/2' to a valid Google Maps embed URL example.
                Replace 'YOUR_Maps_EMBED_URL' with your actual Google Maps embed URL.
            */}
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.261298492022!2d73.9142750750275!3d18.562759982542564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c125642a8a89%3A0x6b4f74d0d02d338e!2sPhoenix%20Marketcity%2C%20Pune!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
