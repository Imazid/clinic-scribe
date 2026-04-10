"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-primary tracking-tight">{BRAND.shortName}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
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
                    ? "text-primary bg-surface-container-low"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
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
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/#waitlist-form"
            className="px-5 py-2.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
          >
            Join the Waitlist
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-container-low transition-colors"
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
                    className="block px-4 py-3 text-sm font-medium text-on-surface rounded-lg hover:bg-surface-container-low transition-colors"
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
                  href="/#waitlist-form"
                  className="block w-full text-center px-5 py-3 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full"
                >
                  Join the Waitlist
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
