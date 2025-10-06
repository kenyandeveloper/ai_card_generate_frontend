// src/components/homepageComponents/Footer.jsx

export default function Footer() {
  return (
    <footer className="py-12 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Flashlearn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
