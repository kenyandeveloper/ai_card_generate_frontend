// src/components/homepageComponents/Footer.jsx

export default function Footer() {
  return (
    <footer className="py-12 bg-surface-elevated border-t border-border-muted">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-text-muted">
          © {new Date().getFullYear()} Flashlearn. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
