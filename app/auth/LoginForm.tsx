"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loginSuccess } from "@/store/slices/authSlice";
import { Eye, EyeOff } from "lucide-react";
import ForgotPassword from "@/components/ClientsideComponent/ForgotPassword/ForgotPassword";
import Image from "next/image";

interface LoginFormProps {
  redirectPath: string;
  onSwitchToRegister: () => void;
}

export default function LoginForm({
  redirectPath,
  onSwitchToRegister,
}: LoginFormProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        dispatch(loginSuccess({ customer: data.user, token: data.token }));
        toast.success("Login successful!");
        router.push(redirectPath);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-0">
      <div className="w-full max-w-5xl flex mx-auto md:p-4 border border-gray-300 bg-white rounded-lg shadow-lg">
        <div className="w-full md:w-1/2 p-5 justify-center flex flex-col">
          {showForgotPassword ? (
            <>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-gray-600 hover:underline mb-4"
              >
                ← Back to Login
              </button>
              <ForgotPassword />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-2">
                  <label className="block text-sm mb-1 text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`w-full p-2 rounded border ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm mb-1 text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full p-2 pr-10 rounded border ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="mb-4 text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[#214364] text-sm hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#214364] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="flex items-center my-2">
                  <hr className="flex-grow border-gray-300" />
                  <span className="px-4 text-gray-500 text-sm">or</span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-[#214364] hover:underline font-medium"
                  >
                    New User? Register Here
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => router.push(redirectPath)}
                    className="text-gray-600 hover:underline font-medium"
                  >
                    Continue as Guest
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="hidden md:flex w-1/2 items-center justify-center bg-[#000842]">
          <Image
            src="https://readymadeui-nextjs-ecommerce-site-3.vercel.app/_next/image?url=%2Fassets%2Fimages%2Fsignin-image.webp&w=1080&q=75"
            alt="Login Illustration"
            width={400}
            height={400}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
