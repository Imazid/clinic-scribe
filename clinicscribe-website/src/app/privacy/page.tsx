import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${BRAND.name}. How we collect, use, and protect your information.`,
};

const sections = [
  {
    title: "1. Information Collection",
    content: `We collect information that you provide directly to us, including when you create an account, request a demo, use our services, or contact us. This may include:

- Personal identification information (name, email address, phone number)
- Professional information (clinic name, role, specialty)
- Clinical audio recordings and transcriptions (processed with your consent)
- Usage data and system interaction logs
- Device and browser information

We collect this information only as necessary to provide and improve our services.`,
  },
  {
    title: "2. Use of Information",
    content: `We use the information we collect to:

- Provide, maintain, and improve our clinical documentation services
- Process and transcribe clinical audio recordings
- Generate AI-drafted clinical notes for clinician review
- Respond to your inquiries and provide customer support
- Send service-related communications
- Monitor and analyse usage patterns to improve the product
- Comply with legal obligations

We do not use patient health information for marketing purposes, AI model training on identifiable data, or any purpose beyond the provision of our documentation services.`,
  },
  {
    title: "3. Data Security",
    content: `We implement industry-standard security measures to protect your information:

- All data is encrypted in transit using TLS 1.3
- All data is encrypted at rest using AES-256 encryption
- Access controls and role-based permissions limit data access to authorised personnel
- Regular security audits and vulnerability assessments
- Secure data centres with physical and logical access controls
- Incident response procedures for security events

While we implement robust security measures, no method of transmission or storage is 100% secure. We continuously work to improve our security posture.`,
  },
  {
    title: "4. Patient Health Information",
    content: `Patient health information processed through our system receives the highest level of protection:

- Audio recordings can be configured for automatic deletion after transcription
- All AI-generated outputs require clinician review and approval before being saved
- Complete audit trails are maintained for all data access and modifications
- We process health information in accordance with the Australian Privacy Principles
- Data residency is maintained in Australia by default
- We do not share patient health information with third parties without explicit authorisation

Clinics are responsible for obtaining appropriate patient consent before using our recording and transcription services.`,
  },
  {
    title: "5. Third Parties",
    content: `We may share information with third parties only in the following circumstances:

- Service providers who assist us in operating our platform (subject to confidentiality agreements)
- When required by law, regulation, or legal process
- To protect the rights, safety, or property of our users or the public
- With your explicit consent

We do not sell personal information or patient health information to third parties. Any service providers we engage are contractually required to maintain the confidentiality and security of the information they process.`,
  },
  {
    title: "6. Your Rights",
    content: `Under Australian privacy law, you have the right to:

- Access the personal information we hold about you
- Request correction of inaccurate or incomplete information
- Request deletion of your personal information (subject to legal retention requirements)
- Withdraw consent for data processing
- Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)

To exercise any of these rights, contact our privacy officer at the details below.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Clinical documentation and audit logs may be retained for periods required by healthcare regulations and clinical governance standards.

When data is no longer required, it is securely deleted or de-identified in accordance with our data retention policy.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "9. Contact",
    content: `If you have questions about this privacy policy or our data practices, please contact us:

Email: ${BRAND.supportEmail}
Location: ${BRAND.location}

For privacy-specific inquiries, please include "Privacy" in the subject line.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="label-text text-secondary mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-6">
            Privacy Policy
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
              placeholder privacy policy for {BRAND.name}. This document should
              be reviewed and updated by your legal team before publishing.
              Healthcare-specific privacy requirements may vary by jurisdiction
              and should be assessed by qualified legal counsel.
            </p>
          </div>

          <div className="prose-like space-y-10">
            <div>
              <p className="text-on-surface-variant leading-relaxed">
                {BRAND.name} (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)
                is committed to protecting the privacy and security of your
                personal information and any patient health information processed
                through our clinical documentation platform. This Privacy Policy
                explains how we collect, use, disclose, and protect information
                in connection with our services.
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
