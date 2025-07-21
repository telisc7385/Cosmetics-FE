import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Modern Plastic Chair",
  description: "Blog Page",
  alternates: {canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/blog`},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
