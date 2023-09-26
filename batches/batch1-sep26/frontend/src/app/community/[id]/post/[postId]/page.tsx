"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/comment-item";
import { getIdTokenNoParam, getCurrentUser } from "@/utils";
import { Blob } from "buffer";
import { toast } from "sonner";

// Interfaces for the post and comment
interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  dislikes: number;
}

interface CommunityPost {
  communityId: string;
  id: string;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  dislikes: number;
  image: string | null;
  comments: Comment[];
  createdAt: any;
  updatedAt: any;
}


export default function PostPage() {
  const { id, postId } = useParams();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to fetch the post from the API
  const fetchPost = async () => {
    try {
      const token = await getIdTokenNoParam();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/get-post?postId=${postId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPost(data.post);
      } else {
        toast.error("Error fetching post");
      }
    } catch (error) {
      toast.error("Error fetching post");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // Handle comment submission
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setLoading(true);
    try {
      const token = await getIdTokenNoParam();
      const currentUser = await getCurrentUser();

      if (token && currentUser) {
        const payload = {
          userId: currentUser?.email,
          postId: postId,
          content: commentContent,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/add-comment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (res.ok) {
          // re-fetch the post to update the comments
          await fetchPost();
          setCommentContent("");
          toast.success("Comment added successfully");
        } else {
          toast.error("Error adding comment");
        }
      }
    } catch (error) {
      toast.error("Error adding comment");
    } finally {
      setLoading(false);
    }
  };

  // If post is not loaded yet, show a simple loading state
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>Posted by {post.author}</span>
                  <span className="mx-1">•</span>
                  <span>{post.timeAgo}</span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-blue-600 mb-4">
              {post.title}
            </h1>
            <p className="text-gray-700 mb-6">{post.content}</p>

            {post.image && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-b border-blue-100 py-3 mb-6">
              <div className="flex items-center gap-1 text-gray-500">
                <button className="hover:text-blue-600 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                    width="20"
                    height="20"
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
                  width="20"
                  height="20"
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
              <div className="flex items-center gap-1 text-gray-500 ml-auto">
                <button className="hover:text-blue-600 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-bookmark"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
                <button className="hover:text-blue-600 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-share"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <path d="m16 6-4-4-4 4" />
                    <path d="M12 2v13" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-blue-600 mb-4">
                Add a Comment
              </h2>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  placeholder="What are your thoughts?"
                  className="min-h-[100px] border-blue-200"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-4">
                Comments ({post.comments.length})
              </h2>
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
