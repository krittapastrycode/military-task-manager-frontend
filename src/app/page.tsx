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

  const loginWithGoogle = async () => {
    try {
      const res = await fetchApi("/api/auth/google/redirect");
      window.location.href = (res as any).url;
    } catch {
      setMessageError("ไม่สามารถเชื่อมต่อ Google ได้");
    }
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
              {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
              Login
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-400">หรือ</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 transition text-base flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
