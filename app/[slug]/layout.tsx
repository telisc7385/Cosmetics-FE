import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Blogs",
//   description: "Blog Page",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
