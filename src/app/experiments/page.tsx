import { ExperimentForm } from "@/components/ExperimentForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExperimentsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LLM Evaluation Platform</h1>
        <Link href="/dashboard">
          <Button variant="outline">View Dashboard</Button>
        </Link>
      </div>
      <ExperimentForm />
    </div>
  );
}
