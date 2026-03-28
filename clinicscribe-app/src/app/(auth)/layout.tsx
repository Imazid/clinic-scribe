import { Stethoscope } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-secondary-fixed blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-on-secondary" />
            </div>
            <span className="text-2xl font-bold text-on-primary">ClinicScribe AI</span>
          </div>
          <h1 className="text-4xl font-bold text-on-primary leading-tight mb-4">
            Focus on patients,<br />not paperwork.
          </h1>
          <p className="text-lg text-on-primary/70 max-w-md">
            AI-powered clinical documentation that drafts structured notes, referrals, and follow-up actions — reviewed and approved by you.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
