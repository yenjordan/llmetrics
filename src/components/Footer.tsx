"use client";

export default function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row gap-8 justify-between p-10 bg-base-100 mt-auto">
      {/* Brand */}
      <aside>
        <p className="text-2xl flex items-center gap-2">
          <img alt="Logo" src="/logo.svg" className="inline w-6" />
          Company
        </p>
        <small className="text-sm">Copyright © 2024 - All rights reserved</small>
      </aside>

      {/* Socials */}
      <nav className="flex gap-4">
        <a className="btn btn-ghost btn-sm btn-circle" href="https://github.com/yenjordan" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-github text-2xl"></i>
        </a>
        <a className="btn btn-ghost btn-sm btn-circle" href="https://www.youtube.com/@jordanyen6656" target="_blank" rel="noopener noreferrer">
          <i className="fa-brands fa-youtube text-2xl"></i>
        </a>
      </nav>
    </footer>
  );
}