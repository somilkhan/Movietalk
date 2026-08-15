import { Seo } from "@/components/Seo";

export default function Sparks() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 pb-24" data-testid="page-sparks">
      <Seo title="Sparks" />
      <div className="max-w-md text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Sparks</h1>
        <p className="mt-3 text-sm md:text-base text-white/50">Sparks content is not connected to a real data source yet.</p>
      </div>
    </div>
  );
}
