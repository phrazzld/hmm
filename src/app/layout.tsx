import type { Metadata } from "next";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserButton } from "@/components/auth/UserButton";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

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
    <html lang="en">
      <body className={`${GeistSans.className} antialiased`}>
        <ConvexClientProvider>
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold hover:opacity-80">
                hmm
              </Link>
              <nav className="flex items-center gap-6">
                <SignedIn>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Home
                  </Link>
                  <Link
                    href="/search"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Search
                  </Link>
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
        </ConvexClientProvider>
      </body>
    </html>
  );
}
