"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("seeker");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 👇 FIX 1: THE INVISIBLE SHIELD (AUTH GUARD)
  // If a user hits the "Back" button to see this page after logging in, 
  // this instantly deflects them back to the dashboard.
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      window.location.replace("/"); 
    }
  }, []);

  // Form Input State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 👇 FIX 4: PREVENT [object Object] ERRORS
        // We ensure we extract a pure string, regardless of how the backend formats it.
        let extractedError = "Authentication failed";
        
        if (data.message) {
          // If message is an object, convert it to a string. Otherwise, use it directly.
          extractedError = typeof data.message === "string" ? data.message : JSON.stringify(data.message);
        } else if (data.errors && data.errors.length > 0) {
          // Handle arrays of error objects (common with express-validator)
          const firstErr = data.errors[0];
          extractedError = firstErr.msg || (typeof firstErr === "string" ? firstErr : JSON.stringify(firstErr));
        }

        throw new Error(extractedError);
      }

      // Save token to localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userRole", role);
      
      // 👇 FIX 2: PREVENT BFCache HISTORY LOOPS
      window.location.replace("/");
      
    } catch (err) {
      // Fallback to ensure we always set a string
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] p-6 font-sans">
      
      {/* ── Architectural Ambient Depth ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-neutral-200/40 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/60 rounded-full blur-[100px]"></div>
      </div>

      {/* ── Premium Minimalist Card ── */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60 overflow-hidden relative z-10">
        
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-50"></div>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-neutral-500 mt-2 text-sm">
              {isLogin 
                ? "Enter your credentials to access your account." 
                : "Join the next generation of professionals."}
            </p>
          </div>

          <div className="flex bg-neutral-100/50 rounded-lg p-1 mb-8 border border-neutral-200/50">
            <button
              type="button"
              onClick={() => setRole("seeker")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                role === "seeker" 
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50" 
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                role === "employer" 
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50" 
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Employer
            </button>
          </div>

          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* 👇 FIX 3: ADDED method="POST" */}
          <form onSubmit={handleSubmit} method="POST" className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 rounded-lg text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder-neutral-400 sm:text-sm"
                  placeholder="John Doe" 
                />
              </div>
            )}

            {!isLogin && role === "employer" && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 rounded-lg text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder-neutral-400 sm:text-sm"
                  placeholder="Acme Industries" 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 rounded-lg text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder-neutral-400 sm:text-sm"
                placeholder="you@example.com" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 rounded-lg text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 outline-none transition-all placeholder-neutral-400 sm:text-sm"
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-neutral-800 focus:ring-4 focus:ring-neutral-900/20 active:bg-black transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              {isLogin ? "New to the platform? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(""); 
                }} 
                className="text-neutral-900 font-medium hover:underline transition-all underline-offset-4"
              >
                {isLogin ? "Sign up here" : "Log in here"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}