import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 bg-white/80 dark:bg-black/80 backdrop-blur text-center text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
        <span>© {new Date().getFullYear()} DSA Tracker. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="https://github.com/Kishor-work1/dsa-tracker" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="w-5 h-5 hover:text-blue-600 transition-colors" />
          </a>
          <a href="https://www.linkedin.com/in/kishor-j-b7bba4213/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5 hover:text-blue-600 transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
} 