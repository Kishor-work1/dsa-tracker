"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in!");
      router.push("/"); // Redirect to home or dashboard
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      let msg = "Login failed. Please try again.";
      
      // Check both error code and message for different error types
      if (err.code === "auth/user-not-found") {
        msg = "No account found with this email. Please register first.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-credential") {
        msg = "User not found. Please register before login.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/user-disabled") {
        msg = "This account has been disabled. Please contact support.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      } else if (err.message?.includes("INVALID_LOGIN_CREDENTIALS")) {
        msg = "User not found. Please register before login.";
      }
      
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to continue your DSA journey.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            {error && (
              <div className="text-red-500 text-sm text-center mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
                {(error.includes("User not found") || error.includes("No account found")) && (
                  <div className="mt-2">
                    <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline">
                      Register here
                    </Link>
                  </div>
                )}
              </div>
            )}
          </form>
        
        </div>
      </div>
    </div>
  );
}