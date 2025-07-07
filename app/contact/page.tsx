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

export default function ContactFormSection() {
  const token = useAppSelector(selectToken);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiCore(
        "/connect/contact_form",
        "POST",
        formData,
        token || undefined
      );
      toast.success("Message sent successfully!");
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
    <section className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-8 py-16 relative">
      <div className="lg:hidden absolute inset-0 -z-10">
        <Image
          src="/BG2.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      </div>

      <div className="container mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-10">
        {/* Left: Form */}
        <div className="w-full lg:w-7/12 bg-white/80 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-pink-200 h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Contact Us
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[16px]"
          >
            {[
              { name: "name", placeholder: "Your Name" },
              { name: "email", type: "email", placeholder: "Email" },
              { name: "phone_number", placeholder: "Phone Number" },
              { name: "city", placeholder: "City" },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                required
                className="border border-[#213E5A] rounded-md px-4 py-2 bg-white text-[16px]"
              />
            ))}

            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="border border-[#213E5A] rounded-md px-4 py-2 bg-white text-gray-600 w-full text-[16px]"
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
              className="border border-[#213E5A] rounded-md px-4 py-2 bg-white text-gray-600 w-full text-[16px]"
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
              className="col-span-1 sm:col-span-2 border border-[#213E5A] rounded-md px-4 py-2 bg-white text-[16px]"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
              className="col-span-1 sm:col-span-2 border border-[#213E5A] rounded-md px-4 py-2 bg-white text-[16px]"
            />

            <button
              type="submit"
              disabled={loading}
              className="col-span-1 sm:col-span-2 bg-[#213E5A] text-white font-semibold py-2 rounded border border-[#213E5A] hover:bg-white hover:text-[#213E5A] transition-all text-[16px]"
            >
              {loading ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>

        {/* Right: Info + Map */}
        <div className="w-full lg:w-5/12 flex flex-col justify-between h-full">
          {company && (
            <div className="flex flex-col bg-[#F3F6F7] rounded-2xl shadow-lg border border-gray-200 px-3 py-2 mb-2 text-[16px]">
              <h3 className="text-md uppercase text-gray-500 mb-3 font-semibold">
                Contact Info
              </h3>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-bold text-[16px]">Address</p>
                    <p className="text-sm">{company.address}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[16px]">Email</p>
                    <p className="text-sm">{company.email}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[16px]">Call</p>
                    <p className="text-sm">{company.phone}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-28 sm:w-36 lg:w-64 xl:w-72">
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

          <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 flex-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.175008753406!2d73.89774167465146!3d18.49106117007603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2ea620bdc521b%3A0x14d7209d899076dc!2sConsociate%20Solutions!5e1!3m2!1sen!2sin!4v1751878629709!5m2!1sen!2sin"
              width="100%"
              height="270"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
