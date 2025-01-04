"use client"; // This must be the first line

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Login successful:", data);
      localStorage.setItem("isAuthenticated", "true");
      router.push("/experiments");
    } else {
      setError(data.error); // Set error message to display
      console.error("Login error:", data.error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <div className="flex items-center justify-center flex-grow">
        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md w-full">
          <h1 className="text-3xl font-bold self-center">Log in</h1>

          {error && <p className="text-red-500">{error}</p>}

          <span className="self-center">
            Don't have an account?
            <a className="link link-secondary" href="/create-account">Register</a>
          </span>

          <a className="btn btn-neutral">
            <i className="fa-brands fa-google text-primary"></i>
            Log in with Google
          </a>

          <div className="divider">OR</div>

          <form onSubmit={handleLogin}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                type="email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="form-control">
              <label className="cursor-pointer label self-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                />
                <span className="label-text">Remember me</span>
              </label>
            </div>

            <div className="mt-4 flex justify-center">
              <button type="submit" className="btn btn-primary">
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}