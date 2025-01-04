"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExperimentForm } from "@/components/ExperimentForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ExperimentsPage() {
  const router = useRouter();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/create-account");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold flex items-center">
          <img alt="LLMetrics Logo" src="/LLMetrics_logo.png" className="w-8 mr-2" />
          LLMetrics
        </h1>
        <ExperimentForm />
      </div>
      <Footer />
    </div>
  );
}
