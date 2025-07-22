import React from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blogDataTypes";

interface BlogCardProps {
  blog: Blog;
}

function SingleBlogCardComponent({ blog }: BlogCardProps) {
  const {
    slug,
    image,
    title,
    product_category_name: category,
    publish_date,
    author,
    content,
  } = blog;

  const formattedDate = new Date(publish_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const primaryColor = "#1A3249"; // Dark blue for elegance
  const accentColor = "#D4AF37"; // A subtle gold/bronze for warmth (example, adjust as needed)
  const textColor = "#333333"; // Dark grey for readability
  const lightTextColor = "#666666"; // Lighter grey for secondary text
  const backgroundColor = "#FFFFFF"; // Clean white background for the card
  const borderColor = "#EEEEEE"; // Very light grey for subtle borders

  return (
    <div
      className="overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: backgroundColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Image with Category Overlay */}
      <Link href={`/blog/${slug}`} className="block relative group">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="w-full h-[200px] lg:h-[300px] object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            loading="lazy"
            placeholder="blur" // optional if you generate blurDataURL
            blurDataURL="/placeholder.png" // keep same ratio placeholder
          />
          {category && (
            <div
              className="absolute top-4 left-4 px-4 py-2 rounded-full text-white text-sm font-semibold tracking-wide uppercase"
              style={{ backgroundColor: primaryColor }}
            >
              <p>{category}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-5">
        {/* Date and Author */}
        <div
          className="mb-3 flex items-center space-x-2 text-sm"
          style={{ color: lightTextColor }}
        >
          <span>{formattedDate}</span>
          <span>&bull;</span>
          <span>{author}</span>
        </div>

        {/* Title */}
        <Link href={`/blog/${slug}`} className="block mb-3">
          <p
            className="text-lg lg:text-2xl font-bold line-clamp-2 leading-tight transition-colors duration-200"
            style={{ color: textColor }}
          >
            {title}
          </p>
        </Link>

        {/* Description */}
        <div
          className="text-base mb-4 overflow-hidden max-h-[4.5em] leading-relaxed"
          style={{ color: lightTextColor }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Continue Reading */}
        <Link
          href={`/blog/${slug}`}
          className="font-semibold text-base flex items-center group"
          style={{ color: primaryColor }}
        >
          Continue Reading{" "}
          <ArrowUpRight
            className="ml-1 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
            size={20}
          />
        </Link>
      </div>
    </div>
  );
}

// Wrap in React.memo to avoid re-renders when parent re-renders without prop change
export default React.memo(SingleBlogCardComponent);
