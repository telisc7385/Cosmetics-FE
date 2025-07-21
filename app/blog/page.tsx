import BlogClient from "@/components/BlogComponents/BlogClient"
import type { Metadata } from "next"

const domain = process.env.NEXT_PUBLIC_DOMAIN

export const metadata: Metadata = {
  title: "Blog - Modern Plastic Chair",
  description: "Explore our latest articles, news, and insights.",
  alternates: {canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/blog`},
  openGraph: {
    title: "Our Blog | Latest Articles & Insights",
    description: "Explore our latest articles, news, and insights.",
url: `${domain}/blogs`,
    images: [
      {
        url: `${domain}/default-og-image.jpg`,
        alt: "Our Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Blog | Latest Articles & Insights",
    description: "Explore our latest articles, news, and insights.",
images: [`${domain}/default-og-image.jpg`],
  },
}

export default function BlogPage() {
  return <BlogClient />
}
