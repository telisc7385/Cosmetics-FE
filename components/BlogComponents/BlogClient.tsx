// app/blog/BlogClient.tsx
"use client"

import { useState, useEffect } from "react"
import { getPaginatedBlogs } from "@/api/blogsApi"
import { Blog } from "@/types/blogDataTypes"
import SingleBlogCard from "./SingleBlogCard"
import Image from "next/image"
import SectionHeader from "../CommonComponents/SectionHeader"

const BlogClient = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const pageSize = 12

  const fetchBlogs = async (pageNumber: number) => {
    if (loading) return
    setLoading(true)
    try {
      const responce = await getPaginatedBlogs(pageNumber, pageSize)
      setBlogs(prev => pageNumber === 1 ? responce.data : [...prev, ...responce.data])
      setHasMore(pageNumber < responce.total_pages)
    } catch (error) {
      console.error("Failed to fetch blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs(1)
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBlogs(nextPage)
  }

  return (
    <div>
      {/* Banner */}
      <div className="w-full h-[300px] sm:h-[400px] md:h-[400px] flex items-center justify-center relative mt-4">
        <Image
          src="/testimonialbg.png"
          alt="store Banner"
          layout="fill"
          objectFit="cover"
          className="absolute"
        />
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 md:px-16">
            <div className="text-black text-center">
              <h2
                className={`text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md transition-opacity duration-500`}
              >
                Insights
              </h2>
            </div>
          </div>
        </div>

        {/* <h2 className="text-white text-4xl lg:text-6xl md:text-2xl font-extrabold z-10">{BannerData?.heading}</h2> */}
      </div>

      {/* Heading */}
      <div className="container mx-auto pt-10">
        <SectionHeader
          title="Look What's Trending!"
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-10 container mx-auto">
        {blogs.map(blog => (
          <div className="border border-[var(--baseGrey)] rounded" key={blog.id}>
            <SingleBlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center pb-12">
        {loading ? (
          <div className="py-4 px-8 bg-gray-200 rounded-md">Loading...</div>
        ) : hasMore ? (
          <button
            onClick={handleLoadMore}
            className="py-4 px-8 bg-[var(--baseOrange)] text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Load More
          </button>
        ) : blogs.length > 0 ? (
          <p className="text-gray-500">No more blogs to load</p>
        ) : null}
      </div>
    </div>
  )
}

export default BlogClient
