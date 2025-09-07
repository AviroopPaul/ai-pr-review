import type { Metadata } from "next";
import Providers from "@/app/components/layout/Providers";

export const metadata: Metadata = {
  title: "KnowYourPR",
  description: "AI-Powered PR Reviewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
