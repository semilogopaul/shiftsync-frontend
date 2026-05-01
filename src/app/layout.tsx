import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/common/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ShiftSync — Multi-location workforce scheduling that shows up",
    template: "%s · ShiftSync",
  },
  description:
    "ShiftSync is the modern shift-management platform for multi-location operators. Build conflict-free schedules, fill callouts in minutes, and keep every site covered.",
  keywords: [
    "workforce management",
    "shift scheduling",
    "restaurant scheduling",
    "multi-location scheduling",
    "employee scheduling",
    "shift swaps",
  ],
  applicationName: "ShiftSync",
  authors: [{ name: "ShiftSync" }],
  openGraph: {
    type: "website",
    title: "ShiftSync — Multi-location workforce scheduling that shows up",
    description:
      "Build conflict-free schedules, fill callouts in minutes, and keep every site covered.",
    siteName: "ShiftSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShiftSync — Workforce scheduling that shows up",
    description:
      "Build conflict-free schedules, fill callouts in minutes, and keep every site covered.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

