interface CommentItemProps {
    comment: {
      id: string
      author: string
      content: string
      timeAgo: string
      likes: number
      dislikes: number
      replies?: any[]
    }
  }
  
  export default function CommentItem({ comment }: CommentItemProps) {
    return (
      <div className="border-b border-blue-100 pb-4 last:border-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {comment.author.charAt(0)}
          </div>
          <div className="font-medium">{comment.author}</div>
          <span className="text-gray-500 text-sm">• {comment.timeAgo}</span>
        </div>
        <div className="pl-10">
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <button className="hover:text-blue-600 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
              <span>{comment.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <button className="hover:text-blue-600 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
              <span>{comment.dislikes}</span>
            </div>
          </div>
  
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="border-l-2 border-blue-100 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                      {reply.author.charAt(0)}
                    </div>
                    <div className="font-medium text-sm">{reply.author}</div>
                    <span className="text-gray-500 text-xs">• {reply.timeAgo}</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <button className="hover:text-blue-600 p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
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
                      <span>{reply.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <button className="hover:text-blue-600 p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
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
                      <span>{reply.dislikes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  