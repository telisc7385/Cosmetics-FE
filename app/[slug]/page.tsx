import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
// import SingleBlogCommentFormComponent from "@/components/PageWiseComponenets/HomePageComponent/BlogComponent/SingleBlogCommentFormComponent"
// import CommentsSection from "@/components/PageWiseComponenets/HomePageComponent/BlogComponent/CommentSection"
import { Suspense } from "react"
import { getPaginatedBlogs } from "@/api/blogsApi"
import { Blog } from "@/types/blogDataTypes"
import SingleBlogCard from "@/components/BlogComponents/SingleBlogCard"
import BlogSkeleton from "@/components/BlogComponents/BlogSkeleton"

const domain = process.env.NEXT_PUBLIC_DOMAIN
const apiBase = process.env.NEXT_PUBLIC_API_URL

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const response = await getPaginatedBlogs(1, 100)
  const blog = response.data.find((b: Blog) => b.slug === slug)

  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "This blog does not exist.",
    }
  }

  const title = blog.title
  const description = blog.seo_metadata || blog.content.slice(0, 150)

  return {
    title,
    description,
    alternates: {canonical: `${process.env.NEXT_PUBLIC_DOMAIN}${slug}`},
    openGraph: {
      title,
      description,
      url: `${domain}/${slug}`,
      images: [
        {
          url: `${apiBase}${blog.image}`,
          alt: blog.image_alternate_text || blog.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${apiBase}${blog.image}`],
    },
  }
}

export async function generateStaticParams() {
  const response = await getPaginatedBlogs(1, 100)
  return response.data.map((blog: Blog) => ({ slug: blog.slug }))
}

export default async function SingleBlogPage({ params }: PageProps) {
  const { slug } = await params

  const response = await getPaginatedBlogs(1, 100)
  const blog = response.data.find((b: Blog) => b.slug === slug)

  if (!blog) {
    notFound()
  }

  const otherBlogs = response.data.filter((b: Blog) => b.slug !== slug).slice(0, 5)
  const formattedDate = new Date(blog.publish_date).toISOString().slice(0, 10);


  return (
    <div className="">
      {/* Static Banner with Title */}
      <div
        className="h-[200px] lg:h-[400px] bg-cover bg-center py-5 lg:py-10 flex justify-center items-center flex-col"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(/contact-us-bg.png)",
        }}
      >
        <h1 className="text-white text-4xl lg:text-6xl font-extrabold">Insights</h1>
      </div>
      <Suspense fallback={<BlogSkeleton />}>
        <div className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-7">
          {/* Left: Blog Content */}
          <div className="lg:w-9/12 space-y-6 border-b-1 pb-3 lg:border-b-0 border-black lg:border-r-2 lg:border-black lg:pr-6">
            <h2 className="text-2xl md:text-4xl lg:text-[40px] font-bold mb-3 md:mb-5 text-[var(--baseOrange)]">
              {blog.title}
            </h2>

            {/* Blog Image */}
            <div className="w-full h-[400px] relative rounded-lg overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.image_alternate_text || blog.title}
                fill
                className="object-contain"
              />
            </div>

            {/* Meta Info */}
            <div className="mb-2 flex items-center space-x-2 text-gray-500 text">
              <span>{formattedDate}</span>
              <span>&bull;</span>
              <span>{blog.author}</span>
            </div>

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none text-lg" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* <SingleBlogCommentFormComponent blogId={blog.id} />
            <CommentsSection slug={slug} /> */}
          </div>

          {/* Right: Other Blogs */}
          <aside className="w-full lg:w-3/12 space-y-4">
            <h3 className="text-2xl md:text-4xl lg:text-[40px] font-bold mb-3 md:mb-5">Related Articles</h3>
            {otherBlogs.map((otherBlog: Blog) => (
              <div className="border border-[var(--baseGrey)] rounded" key={otherBlog.id} >

                <SingleBlogCard blog={otherBlog} />
              </div>
            ))}
          </aside>
        </div>
      </Suspense>

    </div>
  )
}
