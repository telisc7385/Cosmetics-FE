"use client";

import { subscribeToNewsletter } from "@/components/ServersideComponent/NewsletterAction/NewsletterAction";
import { RootState } from "@/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const token = useSelector((state: RootState) => state.auth.token); // eslint-disable-line @typescript-eslint/no-unused-vars

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null); // Clear previous message

    const formData = new FormData();
    formData.append("email", email);

    const res = await subscribeToNewsletter(formData);

    // Example check if message includes 'already subscribed'
    const alreadySubscribed = res.message
      ?.toLowerCase()
      .includes("already subscribed");

    if (res.success && !alreadySubscribed) {
      setMessage({ type: "success", text: res.message });
      setEmail("");
    } else {
      setMessage({ type: "error", text: res.message });
    }

    setIsSubmitting(false);
  };

  return (
    <section className="bg-[#1d3f63] text-[#f3f6f7] py-10 my-5 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Join Our <span className="text-[#9b59b6]">Newsletter</span> Now
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Enter Your Email"
            className="px-4 py-2 rounded-md bg-white text-gray-800 w-full sm:w-2/3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#9b59b6] hover:bg-[#8e44ad] text-[#f3f6f7] px-6 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {/* ✅ Message under input, styled */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
