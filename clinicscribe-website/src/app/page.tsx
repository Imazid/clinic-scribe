import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Problem } from "@/components/sections/Problem";
import { WorkflowDiagram } from "@/components/sections/WorkflowDiagram";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { SafetyFirst } from "@/components/sections/SafetyFirst";
import { RiskControl } from "@/components/sections/RiskControl";
import { IntegrationsPreview } from "@/components/sections/IntegrationsPreview";
import { UseCasesPreview } from "@/components/sections/UseCasesPreview";
import { ROISection } from "@/components/sections/ROISection";
import { Testimonials } from "@/components/sections/Testimonials";
import { Roadmap } from "@/components/sections/Roadmap";
import { PilotProgram } from "@/components/sections/PilotProgram";
import { FAQPreview } from "@/components/sections/FAQPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <WorkflowDiagram />
      <FeatureGrid />
      <SafetyFirst />
      <RiskControl />
      <IntegrationsPreview />
      <UseCasesPreview />
      <ROISection />
      <Testimonials />
      <Roadmap />
      <PilotProgram />
      <FAQPreview />
      <FinalCTA />
    </>
  );
}
