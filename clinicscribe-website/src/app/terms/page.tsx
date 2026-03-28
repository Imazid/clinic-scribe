import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${BRAND.name}. Please read these terms carefully before using our services.`,
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using ${BRAND.name} ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.

These Terms apply to all users of the Service, including clinicians, practice administrators, and any other personnel accessing the platform. If you are using the Service on behalf of a clinic or organisation, you represent that you have the authority to bind that entity to these Terms.`,
  },
  {
    title: "2. Service Description",
    content: `${BRAND.name} provides AI-assisted clinical documentation services, including:

- Ambient transcription of clinical consultations
- AI-generated draft clinical notes (SOAP notes, progress notes, visit summaries)
- Referral letter drafting
- Follow-up task identification
- Prescription drafting assistance
- Billing code suggestions
- Export to clinical software systems

All AI-generated outputs are drafts that require mandatory clinician review and approval before being saved, exported, or acted upon. The Service is a documentation assistance tool and does not provide clinical advice, diagnosis, or treatment recommendations.`,
  },
  {
    title: "3. Medical Disclaimer",
    content: `IMPORTANT: ${BRAND.name} is not a medical device. It is not designed, intended, or marketed for use in clinical decision-making. The Service provides documentation assistance only.

- The Service does not diagnose medical conditions
- The Service does not recommend treatments or therapies
- The Service does not autonomously prescribe medications
- The Service does not replace clinical judgment in any capacity
- The Service does not provide clinical decision support

All AI-generated outputs — including clinical notes, referral drafts, prescription pre-population, and billing code suggestions — are drafts only. They must be reviewed, verified, and approved by a qualified clinician before being finalised, saved to patient records, exported, or acted upon.

The clinician is solely responsible for the accuracy and appropriateness of all clinical documentation that is ultimately saved or transmitted. ${BRAND.name} does not accept liability for clinical decisions made based on AI-generated draft content.

Prescription drafting assistance is limited to pre-populating fields based on consultation context. Every prescription must be independently verified by the prescribing clinician against their clinical judgment and approved through the clinician's existing prescribing workflow.`,
  },
  {
    title: "4. User Responsibilities",
    content: `As a user of the Service, you agree to:

- Review all AI-generated outputs before approving or exporting them
- Maintain appropriate patient consent for audio recording and transcription
- Use the Service only for lawful purposes consistent with applicable healthcare regulations
- Protect your account credentials and not share access with unauthorised persons
- Report any errors, inaccuracies, or security concerns promptly
- Comply with all applicable privacy legislation, including the Australian Privacy Principles
- Ensure that your use of the Service complies with your professional obligations and standards

You acknowledge that the mandatory clinician review step is a critical safety feature and agree not to attempt to bypass, circumvent, or automate the review and approval process.`,
  },
  {
    title: "5. Limitations of Liability",
    content: `To the maximum extent permitted by law:

- ${BRAND.name} provides the Service "as is" without warranties of any kind, express or implied
- We do not guarantee the accuracy, completeness, or reliability of AI-generated outputs
- We are not liable for clinical decisions made based on AI-generated content
- We are not liable for indirect, incidental, or consequential damages arising from use of the Service
- Our total liability is limited to the fees paid by you for the Service in the 12 months preceding the claim

The clinician retains full professional responsibility for all clinical documentation they approve and save through the Service.`,
  },
  {
    title: "6. Intellectual Property",
    content: `The Service, including its software, algorithms, user interface, documentation, and branding, is the intellectual property of ${BRAND.name} and is protected by applicable intellectual property laws.

You retain ownership of your clinical data, including audio recordings, transcriptions, and finalised clinical documentation. You grant us a limited licence to process this data solely for the purpose of providing the Service.

We do not claim ownership of AI-generated clinical notes that have been reviewed and approved by the clinician. The approved documentation belongs to the clinic or practitioner.`,
  },
  {
    title: "7. Data Processing and Privacy",
    content: `Our collection, use, and protection of personal and health information is governed by our Privacy Policy. By using the Service, you acknowledge that you have read and understood our Privacy Policy.

Key data processing commitments:
- All data encrypted in transit and at rest
- Australian data residency by default
- Configurable data retention policies
- Complete audit trail for all data access and modifications
- No sale of personal or health information to third parties`,
  },
  {
    title: "8. Account Termination",
    content: `You may terminate your account at any time by contacting us. We may suspend or terminate your access to the Service if:

- You breach these Terms
- You use the Service in a manner that could harm other users or the integrity of the platform
- Required by law or regulatory authority
- The Service is discontinued

Upon termination, we will provide a reasonable period for you to export your data. After this period, your data will be deleted in accordance with our data retention policy, subject to any legal retention requirements.`,
  },
  {
    title: "9. Changes to Terms",
    content: `We may update these Terms from time to time. Material changes will be communicated via email or through the Service at least 30 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.

If you do not agree with the updated Terms, you may terminate your account before the changes take effect.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from these Terms or your use of the Service will be resolved in the courts of New South Wales, Australia.`,
  },
  {
    title: "11. Contact",
    content: `For questions about these Terms of Service, please contact us:

Email: ${BRAND.supportEmail}
Location: ${BRAND.location}`,
  },
];

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="label-text text-secondary mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-sm text-outline">
            Last updated: March 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-6">
          {/* Disclaimer */}
          <div className="bg-surface-container rounded-xl p-6 mb-12">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-primary">Note:</strong> This is a
              placeholder Terms of Service for {BRAND.name}. This document
              should be reviewed and updated by your legal team before
              publishing. Healthcare-specific regulatory requirements may vary
              by jurisdiction and should be assessed by qualified legal counsel.
            </p>
          </div>

          <div className="prose-like space-y-10">
            <div>
              <p className="text-on-surface-variant leading-relaxed">
                Please read these Terms of Service carefully before using{" "}
                {BRAND.name}. These terms govern your access to and use of our
                clinical documentation platform.
              </p>
            </div>

            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl font-bold text-primary mb-4">
                  {section.title}
                </h2>
                <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
