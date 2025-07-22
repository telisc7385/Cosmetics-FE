// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getPaginatedBlogs, getSingleBlogBySlug } from "@/api/blogsApi";
import { Blog } from "@/types/blogDataTypes";
import SingleBlogComponent from "@/components/BlogComponents/SingleBlogComponent";

type Props = {
  params: Promise<{ slug: string }>;
};
export default async function SingleBlogPage({
  params,
}: Props) {
  const { slug } = await params;

  const Singleblog = await getSingleBlogBySlug(slug);
  const blog = Singleblog?.data;

  if (!blog) {
    notFound();
  }

  const allBlogsResponse = await getPaginatedBlogs(1, 5);
  const otherBlogs = allBlogsResponse?.data
    ?.filter((b: Blog) => b.slug !== slug)
    ?.slice(0, 5);

  return <SingleBlogComponent blog={blog} otherBlogs={otherBlogs} />;
}
