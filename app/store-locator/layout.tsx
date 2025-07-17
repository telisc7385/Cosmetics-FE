import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Locator - Cosmetics",
  description: "Location Locate Us",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/store-locator` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
