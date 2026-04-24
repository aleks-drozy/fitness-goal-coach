import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WizardProvider } from "@/context/WizardContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fitness Goal Coach",
  description: "Get a realistic estimate of what your fitness goal may take.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-zinc-950 text-zinc-50 font-sans antialiased">
        <WizardProvider>{children}</WizardProvider>
      </body>
    </html>
  );
}
