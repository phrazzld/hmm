import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { Crimson_Text } from "next/font/google";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserButton } from "@/components/auth/UserButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
});

export const metadata: Metadata = {
  title: "hmm - A place for curiosity",
  description: "Semantic question journaling powered by meaning, not metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} ${crimson.variable} antialiased bg-bg-canvas`}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-5 flex justify-between items-center max-w-5xl">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="text-2xl font-serif font-semibold text-interactive-primary hover:text-interactive-hover transition-colors duration-200"
                >
                  hmm
                </Link>
                <SignedIn>
                  <Link
                    href="/questions"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 relative group"
                  >
                    questions
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-interactive-primary transition-all duration-200 group-hover:w-full" />
                  </Link>
                </SignedIn>
              </div>
              <nav className="flex items-center gap-4">
                <ThemeToggle />
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <Toaster />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
