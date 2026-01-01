import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "We See You | Anonymous Abuse Reporting Platform",
  description:
    "A community-powered platform for anonymously reporting abusive social media accounts. Stand together against online harassment.",
  keywords: [
    "harassment",
    "abuse reporting",
    "social media safety",
    "anonymous reporting",
    "instagram",
    "twitter",
    "online safety",
  ],
  openGraph: {
    title: "We See You | Anonymous Abuse Reporting Platform",
    description:
      "A community-powered platform for anonymously reporting abusive social media accounts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
