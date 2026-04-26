import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "@/context/WizardContext";
import { Nav } from "@/components/layout/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Goal Coach",
  description: "Get a realistic estimate of what your fitness goal may take.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        <WizardProvider>
          <Nav />
          <div className="pt-12">{children}</div>
        </WizardProvider>
      </body>
    </html>
  );
}
