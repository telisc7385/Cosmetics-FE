import React from "react"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Blog } from "@/types/blogDataTypes"

interface BlogCardProps {
  blog: Blog
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
  } = blog

  const formattedDate = new Date(publish_date).toISOString().slice(0, 10);


  return (
    <div className="overflow-hidden">
      {/* Image with Category Overlay */}
      <Link
        href={`/${slug}`}
        className="block relative group border-b-[1px] border-[var(--baseGrey)] bg-[var(--backgroundGrey)]"
      >
        <div className="relative">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="w-full h-[200px] lg:h-[300px] object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            loading="lazy"
            placeholder="blur"                // optional if you generate blurDataURL
            blurDataURL="/placeholder.png"    // keep same ratio placeholder
          />
          {category && (
            <div className="absolute top-3 left-3 bg-[var(--baseOrange)] text-white px-3 py-1 rounded">
              <p className="text-sm font-semibold">{category}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Date and Author */}
        <div className="mb-2 flex items-center space-x-2 text-gray-500">
          <span>{formattedDate}</span>
          <span>&bull;</span>
          <span>{author}</span>
        </div>

        {/* Title */}
        <Link href={`/${slug}`} className="block">
          <p className="text-xl lg:text-2xl font-medium mb-2 line-clamp-2 hover:text-[var(--baseOrange)] transition-colors duration-200">
            {title}
          </p>
        </Link>

        {/* Description */}
        <div
          className="text-gray-700 text-base mb-4 overflow-hidden max-h-[4.5em] leading-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Continue Reading */}
        <Link
          href={`/${slug}`}
          className="text-[var(--baseOrange)] font-semibold text-base hover:underline flex"
        >
          Continue Reading <ArrowUpRight />
        </Link>
      </div>
    </div>
  )
}

// Wrap in React.memo to avoid re‑renders when parent re‑renders without prop change
export default React.memo(SingleBlogCardComponent)
