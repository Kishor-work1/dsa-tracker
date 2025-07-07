"use client";

import Link from "next/link";
import { BarChart3, BookOpen, Home, Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null as null | { displayName: string | null, email: string | null });
  const router = useRouter();

  useEffect(() => {
    // Check for theme
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ displayName: firebaseUser.displayName, email: firebaseUser.email });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
          <span className="text-blue-600">DSA</span> Tracker
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm font-medium">
            <Home size={16} />
            Dashboard
          </Link>
          <Link href="/problems" className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm font-medium">
            <BookOpen size={16} />
            Problems
          </Link>
          <Link href="/statistics" className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm font-medium">
            <BarChart3 size={16} />
            Statistics
          </Link>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <>
              <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                <User size={16} />
                {user.displayName || user.email || 'Profile'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center cursor-pointer gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center cursor-pointer gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 