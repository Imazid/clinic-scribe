"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { BRAND, NAV_ITEMS } from "@/lib/constants";

type NavItem = (typeof NAV_ITEMS)[number];
function hasChildren(item: NavItem): item is NavItem & { children: ReadonlyArray<{ label: string; href: string; description: string }> } {
  return "children" in item && item.children !== undefined;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass shadow-ambient-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/monogram.svg"
            alt="Miraa"
            width={30}
            height={30}
            className="rounded-lg transition-transform group-hover:scale-105"
          />
          <span className="text-[17px] font-bold text-primary tracking-tight">{BRAND.shortName}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 ml-14">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => hasChildren(item) && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1 ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-secondary bg-secondary-fixed/20"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                {item.label}
                {hasChildren(item) && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      activeDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>

              {/* Dropdown */}
              <AnimatePresence>
                {hasChildren(item) && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-72 p-2 bg-surface-container-lowest rounded-xl shadow-ambient-lg"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                      >
                        <div className="text-sm font-semibold text-primary">{child.label}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{child.description}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <Link
            href="/demo"
            className="text-sm font-medium text-primary hover:opacity-78 transition-opacity"
          >
            Sign in
          </Link>
          <Link
            href="/waitlist"
            className="px-5 py-2.5 text-[13px] font-semibold text-on-primary bg-primary rounded-full hover:-translate-y-px hover:shadow-ambient-sm transition-all"
          >
            Join the waitlist
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden glass"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-2">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-sm font-medium text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    {item.label}
                  </Link>
                  {hasChildren(item) && item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-8 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <Link
                  href="/waitlist"
                  className="block w-full text-center px-5 py-3 text-sm font-semibold text-on-primary bg-primary rounded-full"
                >
                  Join the waitlist
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
