import { Blog } from "@/types/blogDataTypes";
import React, { Suspense } from "react";
import BlogSkeleton from "./BlogSkeleton";
import SingleBlogCard from "./SingleBlogCard";
import Image from "next/image";

type Props = {
  blog: any;
  otherBlogs: any;
};

const SingleBlogComponent = ({ blog, otherBlogs }: Props) => {
  // Define the primary color for consistency
  const primaryColor = "#1A3249";
  const textColor = "#333333";
  const lightTextColor = "#666666";

  const formattedDate = new Date(blog.publish_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

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
};

export default SingleBlogComponent;
