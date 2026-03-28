import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Insights & Resources",
  description: `Perspectives on clinical documentation, AI in healthcare, and practice efficiency from the ${BRAND.name} team.`,
};

const categories = [
  "Clinical Documentation",
  "AI & Safety",
  "Practice Management",
];

const posts = [
  {
    title: "Why Documentation Burden is the Biggest Threat to Clinician Wellbeing",
    excerpt:
      "Australian clinicians spend over 2 hours per day on documentation. We examine the evidence, the consequences, and what can be done about it.",
    date: "March 2026",
    category: "Clinical Documentation",
    gradient: "from-primary to-primary-container",
    readTime: "6 min read",
  },
  {
    title: "Clinician-in-the-Loop: Why Mandatory Review Matters in AI Healthcare Tools",
    excerpt:
      "Not all AI tools are created equal. We explore why mandatory clinician review is a non-negotiable safety requirement — not just a feature checkbox.",
    date: "February 2026",
    category: "AI & Safety",
    gradient: "from-secondary to-primary-container",
    readTime: "8 min read",
  },
  {
    title: "SOAP Notes, Structured Outputs, and Why Format Matters",
    excerpt:
      "Structured clinical notes improve consistency, readability, and downstream workflows. Here is how AI-assisted documentation maintains structured quality at scale.",
    date: "January 2026",
    category: "Clinical Documentation",
    gradient: "from-primary-container to-secondary",
    readTime: "5 min read",
  },
  {
    title: "Integrating AI Documentation Tools with Australian Clinical Software",
    excerpt:
      "Best Practice, MedicalDirector, and beyond — the integration landscape for AI clinical documentation tools in Australia.",
    date: "January 2026",
    category: "Practice Management",
    gradient: "from-secondary to-primary",
    readTime: "7 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-container-low pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="label-text text-secondary mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6">
            Insights &amp; Resources
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
            Perspectives on clinical documentation, AI in healthcare, and
            practice efficiency.
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-surface py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-full">
              All
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-lowest rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <article
                key={i}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient-sm hover:shadow-ambient transition-shadow group"
              >
                {/* Placeholder Image */}
                <div
                  className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-secondary/10 text-secondary rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-outline">{post.date}</span>
                    <span className="text-xs text-outline">
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-sm font-semibold text-secondary">
                    Read more &rarr;
                  </span>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-sm text-outline mt-12">
            More articles coming soon. Subscribe to stay updated.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
            Stay Updated
          </h2>
          <p className="text-on-surface-variant mb-8">
            Follow our blog for insights on clinical documentation, AI safety in
            healthcare, and practice management best practices.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-on-primary bg-gradient-to-r from-primary to-primary-container rounded-full hover:opacity-90 transition-opacity"
          >
            Book a Demo
          </Link>
        </div>
      </section>
    </>
  );
}
