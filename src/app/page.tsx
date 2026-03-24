"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email) errors.email = "กรุณากรอกอีเมล";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "อีเมลไม่ถูกต้อง";
    if (!password) errors.password = "กรุณากรอกรหัสผ่าน";
    else if (password.length < 6) errors.password = "ต้องมีอย่างน้อย 6 อักษร";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setMessageError(null);
    try {
      const response: any = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("profile", JSON.stringify(response.data || response.user));
      router.push("/home");
    } catch (err: any) {
      if (err?.statusCode === 422 && err?.data?.errors) {
        const errs: Record<string, string> = {};
        for (const [key, val] of Object.entries(err.data.errors)) {
          errs[key] = Array.isArray(val) ? val[0] : String(val);
        }
        setFieldErrors(errs);
      } else {
        setMessageError(err?.data?.message || err?.message || "เกิดข้อผิดพลาด");
      }
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <section className="relative bg-[#eaf2f9] overflow-hidden h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaf2f9] to-[#c7d8e8]" />

      <div className="absolute top-0 flex flex-col items-center w-full h-full z-10">
        <div className="flex flex-col items-center px-6 pb-8 pt-10 sm:pt-24">
          <div className="flex flex-col gap-6 items-center">
            <img
              src="/Emblem_of_the_Royal_Thai_Air_Force.svg.png"
              className="w-24 h-auto drop-shadow-lg"
              alt="logo"
            />
            <h1 className="text-4xl lg:text-5xl text-center text-gray-900 font-bold">
              Sign in
            </h1>
            <div className="text-base lg:text-xl font-light text-center text-gray-900">
              ลงชื่อเข้าใช้ระบบจัดการภารกิจทหาร
            </div>
          </div>

          <form onSubmit={login} className="pt-10 w-full max-w-[400px] space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                placeholder="sample@email.com"
                disabled={isLoading}
                autoComplete="username"
                className={`w-full px-4 py-3.5 text-base text-gray-900 bg-slate-50 rounded-xl shadow-sm border-0 ring-1 ring-inset focus:ring-2 focus:outline-none transition
                  ${fieldErrors.email ? "ring-red-400" : "ring-[#a6bed3] focus:ring-indigo-500"}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Password"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full px-4 py-3.5 text-base text-gray-900 bg-slate-50 rounded-xl shadow-sm border-0 ring-1 ring-inset focus:ring-2 focus:outline-none transition
                  ${fieldErrors.password ? "ring-red-400" : "ring-[#a6bed3] focus:ring-indigo-500"}`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Error Alert */}
            {messageError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="flex-1">{messageError}</span>
                <button onClick={() => setMessageError(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-sm transition text-base flex items-center justify-center gap-2"
            >
              {isLoading && (
                <Loader2 className="animate-spin w-5 h-5" />
              )}
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
