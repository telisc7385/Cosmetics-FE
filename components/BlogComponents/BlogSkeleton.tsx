export default function BlogSkeleton() {
    return (
      <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
        {/* Main Content Skeleton */}
        <div className="lg:w-9/12 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
            {/* Title Skeleton */}
            <div className="h-10 bg-gray-200 rounded-md mb-4 w-3/4"></div>
  
            {/* Meta Info Skeleton */}
            <div className="flex space-x-4 mb-6">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
  
            {/* Image Skeleton */}
            <div className="w-full h-[400px] bg-gray-200 rounded-lg mb-6"></div>
  
            {/* Content Skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
  
        {/* Sidebar Skeleton */}
        <div className="lg:w-3/12 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  