import { BuryForm } from "@/components/bury-form";

export const metadata = {
  title: "Bury a Project",
};

export default function BuryPage() {
  return (
    <div>
      <h1 className="text-lg font-medium mb-1">Bury a Project</h1>
      <div className="h-px bg-border mb-8" />
      <BuryForm />
    </div>
  );
}
