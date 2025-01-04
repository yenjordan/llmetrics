"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Registration successful:", data);
      router.push("/experiments");
    } else {
      console.error("Registration error:", data.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md w-full">
        <h1 className="text-3xl font-bold self-center">Create an account</h1>

        <span className="self-center">
          Already have an account?
          <a className="link link-secondary" href="/login">Log in</a>
        </span>

        <a className="btn btn-neutral">
          <i className="fa-brands fa-google text-primary"></i>
          Create with Google
        </a>

        <div className="divider my-0">OR</div>

        <form onSubmit={handleSubmit}>
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

          <label className="form-control">
            <div className="label">
              <span className="label-text">Confirm password</span>
            </div>
            <input
              type="password"
              className="input input-bordered"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <div className="mt-4 flex justify-center">
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}