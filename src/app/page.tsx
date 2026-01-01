"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  Bell,
  Lock,
  Users,
  ArrowRight,
  Zap,
  FileWarning,
} from "lucide-react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 20 ? "nav-blur border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Eye className="w-6 h-6" />
            <span className="font-semibold tracking-tight">We See You</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/anonymity"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {mounted && (
            <>
              <div className="badge-accent mb-6 animate-fade-in opacity-0">
                Protecting communities since 2024
              </div>

              <h1 className="display-hero mb-6 text-balance animate-fade-in-up opacity-0 delay-100">
                Report abuse.
                <br />
                <span className="text-muted-foreground">Stay anonymous.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-fade-in-up opacity-0 delay-200">
                A community platform for anonymously flagging abusive accounts
                on Instagram and X. When platforms fail to act, we step in.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up opacity-0 delay-300">
                <Link
                  href="/register"
                  className="btn-primary px-6 py-3 text-sm gap-2 group"
                >
                  Start Reporting
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="btn-secondary px-6 py-3 text-sm"
                >
                  Learn More
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "90%", label: "Reports ignored by platforms" },
              { value: "73%", label: "Women face online harassment" },
              { value: "3", label: "Reports to trigger alert" },
              { value: "100%", label: "Anonymous reporting" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="section-padding px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="display-lg mb-3">Built for safety</h2>
            <p className="text-muted-foreground">
              Every feature designed to protect you and your community.
            </p>
          </div>

          <div className="feature-grid md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Zero-knowledge privacy",
                description:
                  "Your identity is never stored or revealed. We can't expose what we don't have.",
              },
              {
                icon: Users,
                title: "Collective intelligence",
                description:
                  "Multiple independent reports create an undeniable pattern of abuse.",
              },
              {
                icon: Bell,
                title: "Real-time alerts",
                description:
                  "Instant notifications when flagged accounts cross the danger threshold.",
              },
              {
                icon: Eye,
                title: "Evidence-based",
                description:
                  "Upload screenshots and documentation. Every report is substantiated.",
              },
              {
                icon: Shield,
                title: "Human review",
                description:
                  "Our moderation team verifies reports to prevent system abuse.",
              },
              {
                icon: Zap,
                title: "Cross-platform",
                description:
                  "Report abuse on Instagram and X from one unified interface.",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <feature.icon className="w-5 h-5 mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="section-padding px-6 bg-gradient-subtle"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="display-lg mb-3">How it works</h2>
            <p className="text-muted-foreground">
              Three steps to protect yourself and your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign up",
                description:
                  "Create an account with Google. Your identity stays encrypted and private.",
              },
              {
                step: "02",
                title: "Report",
                description:
                  "Submit reports with evidence. Select platform, category, and upload screenshots.",
              },
              {
                step: "03",
                title: "Alert",
                description:
                  "When accounts hit 3 reports, the community is notified to stay safe.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center md:text-left">
                <div className="text-xs text-accent font-medium tracking-wider mb-3">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Mission */}
      <section id="about" className="section-padding px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FileWarning className="w-8 h-8 mx-auto mb-6 text-muted-foreground" />
          <h2 className="display-md text-muted-foreground mb-6 text-balance">
            <span className="text-foreground">
              Platform moderation has failed.
            </span>{" "}
            Studies show nearly 90% of abuse reports are ignored. We&apos;re
            building the accountability layer social media desperately needs.
          </h2>
          <Link
            href="/register"
            className="link-accent inline-flex items-center gap-1.5"
          >
            Join us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="display-lg mb-4">Ready to make a difference?</h2>
          <p className="text-muted-foreground mb-8">
            Your voice matters. Your identity stays protected.
          </p>
          <Link
            href="/register"
            className="btn-primary px-8 py-3.5 text-sm gap-2 group inline-flex"
          >
            Get Started — Free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span className="font-medium">We See You</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 We See You. Built to protect communities.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/anonymity"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
