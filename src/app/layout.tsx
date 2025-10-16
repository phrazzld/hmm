import type { Metadata } from "next";
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
              <h1 className="text-2xl font-bold">hmm</h1>
              <nav className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
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
