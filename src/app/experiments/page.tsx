import { ExperimentForm } from "@/components/ExperimentForm";

export default function ExperimentsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LLM Evaluation Platform</h1>
      <ExperimentForm />
    </div>
  );
}
