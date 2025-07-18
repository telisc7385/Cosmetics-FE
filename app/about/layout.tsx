import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Cosmetic",
  description: "About Our Company",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/about` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
