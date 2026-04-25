import { PreLaunchHero } from "@/components/sections/PreLaunchHero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Problem } from "@/components/sections/Problem";
import { WorkflowDiagram } from "@/components/sections/WorkflowDiagram";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { DeviceGallery } from "@/components/sections/DeviceGallery";
import { SafetyFirst } from "@/components/sections/SafetyFirst";
import { RiskControl } from "@/components/sections/RiskControl";
import { IntegrationsPreview } from "@/components/sections/IntegrationsPreview";
import { UseCasesPreview } from "@/components/sections/UseCasesPreview";
import { ROISection } from "@/components/sections/ROISection";
import { Testimonials } from "@/components/sections/Testimonials";
import { Roadmap } from "@/components/sections/Roadmap";
import { PilotProgram } from "@/components/sections/PilotProgram";
import { EarlyAccessCTA } from "@/components/sections/EarlyAccessCTA";
import { FAQPreview } from "@/components/sections/FAQPreview";
import { PreLaunchFinalCTA } from "@/components/sections/PreLaunchFinalCTA";

export default function HomePage() {
  return (
    <>
      <PreLaunchHero />
      <TrustBar />
      <Problem />
      <WorkflowDiagram />
      <FeatureGrid />
      <DeviceGallery />
      <SafetyFirst />
      <RiskControl />
      <IntegrationsPreview />
      <UseCasesPreview />
      <ROISection />
      <Testimonials />
      <Roadmap />
      <PilotProgram />
      <EarlyAccessCTA />
      <FAQPreview />
      <PreLaunchFinalCTA />
    </>
  );
}
