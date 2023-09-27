import Link from "next/link"
import { Post } from "@/app/community/[id]/page"
interface PostItemProps {
  post: Post,
  communityId: string
  communityName: string
}

export default function PostItem({ post, communityId, communityName }: PostItemProps) {
  return (
    <div className="border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
          {post.author.charAt(0)}
        </div>
        <div className="text-blue-600 font-medium hover:underline">
          {post.author}
        </div>
        <span className="text-gray-500 text-sm">• {post.timeAgo}</span>
      </div>
      <Link href={`/community/${communityId}/post/${post.id}`}>
        <h3 className="text-lg font-medium text-blue-600 mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3">{post.content}</p>
        {post.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-auto" />
          </div>
        )}
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-500">
          <button className="hover:text-blue-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-thumbs-up"
            >
              <path d="M7 10v12" />
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
            </svg>
          </button>
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <button className="hover:text-blue-600 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-thumbs-down"
            >
              <path d="M17 14V2" />
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
            </svg>
          </button>
          <span>{post.dislikes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-square"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{post.comments.length} comments</span>
        </div>
      </div>
    </div>
  )
}

