export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 mt-20 bg-white/80 dark:bg-black/80 backdrop-blur text-center text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
        <span>© {new Date().getFullYear()} DSA Tracker. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <a href="#contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
} 