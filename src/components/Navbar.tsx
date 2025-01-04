"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const currentPath = usePathname();

  const handleLogout = () => {
    // Implement logout logic here
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  return (
    <nav className="navbar justify-between bg-base-100">
      {/* Logo */}
      <a className="btn btn-ghost text-lg">
        <img alt="LLMetrics Logo" src="/LLMetrics_logo.png" className="w-8" />
        LLMetrics
      </a>

      {/* Menu for mobile */}
      <div className="dropdown dropdown-end sm:hidden">
        <button className="btn btn-ghost">
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        <ul tabIndex={0} className="dropdown-content menu z-[1] bg-base-200 p-6 rounded-box shadow w-56 gap-2">
          {currentPath === "/experiments" && (
            <>
              <li><a onClick={() => router.push("/dashboard")}>Dashboard</a></li>
              <li><a onClick={handleLogout}>Log Out</a></li>
            </>
          )}
          {currentPath === "/dashboard" && (
            <>
              <li><a onClick={() => router.push("/experiments")}>Experiments</a></li>
              <li><a onClick={handleLogout}>Log Out</a></li>
            </>
          )}
        </ul>
      </div>

      {/* Menu for desktop */}
      <ul className="hidden menu sm:menu-horizontal gap-2">
        {currentPath === "/experiments" && (
          <>
            <li><a onClick={() => router.push("/dashboard")}>Dashboard</a></li>
            <li><a onClick={handleLogout}>Log Out</a></li>
          </>
        )}
        {currentPath === "/dashboard" && (
          <>
            <li><a onClick={() => router.push("/experiments")}>Experiments</a></li>
            <li><a onClick={handleLogout}>Log Out</a></li>
          </>
        )}
      </ul>
    </nav>
  );
}