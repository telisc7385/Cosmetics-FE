import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPaginatedBlogs, getSingleBlogBySlug } from "@/api/blogsApi"; // Import getSingleBlogBySlug
import { Blog } from "@/types/blogDataTypes";
import SingleBlogCard from "@/components/BlogComponents/SingleBlogCard";
import BlogSkeleton from "@/components/BlogComponents/BlogSkeleton";

type PageProps = {
  params: { slug: string }; // Corrected type for params
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params; // Directly access slug from params
  // console.log("blog slug", slug); // Keep for debugging if needed
  const Singleblog = await getSingleBlogBySlug(slug);
  const blog = Singleblog.data;
  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "This blog does not exist.",
    };
  }

  const title = blog.title;
  // Use seo_metadata if available, otherwise truncate content. Ensure content is string.
  const description =
    blog.seo_metadata ||
    (typeof blog.content === "string" ? blog.content.slice(0, 150) : "");

  return {
    title,
    description,
    // alternates: { canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/blog/${slug}` }, // Ensure your canonical URL matches your actual slug path
    // openGraph: {
    //   title,
    //   description,
    //   url: `${domain}/blog/${slug}`, // Ensure your Open Graph URL matches your actual slug path
    //   images: [
    //     {
    //       url: `${apiBase}${blog.image}`,
    //       alt: blog.image_alternate_text || blog.title,
    //     },
    //   ],
    //   type: "article",
    // },
    // twitter: {
    //   card: "summary_large_image",
    //   title,
    //   description,
    //   images: [`${apiBase}${blog.image}`],
    // },
  };
}

export async function generateStaticParams() {
  const response = await getPaginatedBlogs(1, 100); // Still need all slugs for static generation
  // Ensure response.data is an array before mapping
  return response.data
    ? response.data.map((blog: Blog) => ({ slug: blog.slug }))
    : [];
}

export default async function SingleBlogPage({ params }: PageProps) {
  const { slug } = params; // Directly access slug from params

  const Singleblog = await getSingleBlogBySlug(slug);
  const blog = Singleblog.data;

  // console.log(blog); // Keep for debugging if needed

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.publish_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // To get other blogs, you still need to fetch paginated blogs.
  // You might consider a separate API endpoint for "related blogs" if your backend can provide that more efficiently.
  const allBlogsResponse = await getPaginatedBlogs(1, 100); // Or fetch only a small number of blogs for "related" section
  const otherBlogs = allBlogsResponse.data
    ?.filter((b: Blog) => b.slug !== slug)
    ?.slice(0, 5); // Limit to 5 related articles

  // Define the primary color for consistency
  const primaryColor = "#1A3249";
  const textColor = "#333333";
  const lightTextColor = "#666666";

  return (
    <div className="bg-white">
      {/* Constant Banner */}
      <div
        className="h-[250px] md:h-[350px] lg:h-[450px] bg-cover bg-center py-5 lg:py-10 flex justify-center items-center flex-col text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)),url(/BG1.jpg)`, // Static banner image
          backgroundColor: primaryColor, // Fallback background color
        }}
      >
        <h1 className="text-white sm:text-3xl md:text-5xl lg:text-5xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md">
          {blog.title}
        </h1>
        <p
          className="text-white text-sm sm:text-base md:text-lg mt-2"
          style={{ color: "rgba(255,255,255,0.8)" }}
        >
          By {blog.author} &bull; {formattedDate}
        </p>
      </div>

      {/* Main Content Container */}
      <div className=" px-4 py-10 lg:py-14 bg-white rounded-lg shadow-lg -mt-10 relative z-10">
        <Suspense fallback={<BlogSkeleton />}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left: Blog Content */}
            <div className="lg:w-9/12 space-y-8 lg:border-r lg:border-gray-200 lg:pr-8">
              <h2
                className="text-xl sm:text-2xl md:text-2xl lg:text-4xl font-bold mb-3 md:mb-5"
                style={{ color: primaryColor }}
              >
                {blog.title}
              </h2>

              {/* Blog Image */}
              <div className="w-11/12 mx-auto h-[250px] md:h-[350px] lg:h-[450px] relative rounded-lg overflow-hidden">
                {" "}
                {/* Changed w-full to w-11/12 and added mx-auto */}
                <Image
                  src={blog.image}
                  alt={blog.image_alternate_text || blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                />
              </div>

              {/* Meta Info */}
              <div
                className="mb-2 flex items-center space-x-2 text-sm sm:text-base"
                style={{ color: lightTextColor }}
              >
                <span>{formattedDate}</span>
                <span>&bull;</span>
                <span>{blog.author}</span>
              </div>

              {/* Blog Content */}
              <div
                className="prose prose-base sm:prose-lg max-w-none leading-relaxed text-justify"
                style={{ color: textColor }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* <SingleBlogCommentFormComponent blogId={blog.id} />
              <CommentsSection slug={slug} /> */}
            </div>

            {/* Right: Other Blogs */}
            <aside className="w-full lg:w-3/12 space-y-6">
              <h3
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
                style={{
                  color: primaryColor,
                }}
              >
                Related Insights
              </h3>
              {otherBlogs && otherBlogs.length > 0 ? (
                otherBlogs.map((otherBlog: Blog) => (
                  <div
                    className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    style={{ border: `1px solid #E0E0E0` }} // Lighter, subtle border
                    key={otherBlog.id}
                  >
                    <SingleBlogCard blog={otherBlog} />
                  </div>
                ))
              ) : (
                <p className="text-sm sm:text-base text-gray-500">
                  No related articles found.
                </p>
              )}
            </aside>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
