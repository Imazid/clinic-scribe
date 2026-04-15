'use client';

import { cn } from '@/lib/utils';

interface Country {
  iso: string;
  name: string;
  dial: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { iso: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { iso: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { iso: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { iso: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { iso: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { iso: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { iso: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { iso: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { iso: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { iso: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { iso: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
  { iso: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { iso: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { iso: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { iso: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { iso: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { iso: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { iso: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { iso: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { iso: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
];

export function countryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso);
}

interface PhoneInputProps {
  id?: string;
  label?: string;
  country: string;
  phone: string;
  onCountryChange: (iso: string) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

export function PhoneInput({
  id = 'phone',
  label = 'Phone Number',
  country,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
}: PhoneInputProps) {
  const active = countryByIso(country) ?? COUNTRIES[0];

  function handlePhoneInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // allow + only at the start, otherwise digits + spaces
    const cleaned = raw.replace(/[^\d +]/g, '').replace(/(?!^)\+/g, '');
    onPhoneChange(cleaned);
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-stretch rounded-lg border border-outline-variant bg-surface-container-low transition-colors focus-within:ring-2 focus-within:ring-secondary focus-within:border-transparent',
          error && 'border-error focus-within:ring-error'
        )}
      >
        <div className="relative flex items-center border-r border-outline-variant/60 pr-1 pl-2">
          <span className="pointer-events-none mr-1 text-base leading-none" aria-hidden>
            {active.flag}
          </span>
          <span className="pointer-events-none mr-1 text-xs font-medium text-on-surface-variant">
            {active.dial}
          </span>
          <select
            aria-label="Country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent focus:outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso} className="text-on-surface">
                {c.flag} {c.name} ({c.dial})
              </option>
            ))}
          </select>
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={handlePhoneInput}
          placeholder="400 123 456"
          className="flex-1 rounded-r-lg bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
