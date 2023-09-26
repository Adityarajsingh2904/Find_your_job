"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Post {
  id: string;
  timeAgo: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  dislikes: number;
  comments?: any[];
}

export interface Community {
  communityId: string;
  communityName: string;
  communityDescription: string;
  communityType: string;
  communityTopics: string[];
  communityRules: string[];
  communityProfilePhoto: string;
  communityBackgroundPhoto: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  memberCount: number;
  posts?: Post[];
}

interface JoinedPostsResponse {
  message: string;
  communities: Community[];
}

export default function AllPostsPage() {
  const [allPosts, setAllPosts] = useState<(Post & { communityId: string; communityName: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAllPosts = async (): Promise<void> => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;
        const idToken = await getIdTokenNoParam();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/joined-posts?userId=${currentUser.uid}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) toast.error("Failed to fetch joined posts");
        const data: JoinedPostsResponse = await res.json();
        // Flatten posts: get all posts from every community.
        const posts: (Post & { communityId: string; communityName: string })[] = [];
        (data.communities || []).forEach((community) => {
          if (community.posts && community.posts.length > 0) {
            community.posts.forEach((post) => {
              posts.push({
                ...post,
                communityId: community.communityId,
                communityName: community.communityName,
              });
            });
          }
        });
        setAllPosts(posts);
      } catch (error) {
        toast.error("Error fetching all posts");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-blue-600">All Community Posts</h1>
            <p className="text-blue-600/80">
              Browse posts from all the communities you've joined.
            </p>
          </div>
          {/* Layout Container */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* About BlueCollar Component - on mobile, appears on top */}
            <div className="order-1 w-full md:w-[30%]">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">About BlueCollar</h2>
                <p className="text-gray-700 mb-4">
                  BlueCollar is a community platform for blue collar workers to find jobs, share experiences, and connect with others in their industry.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                        className="text-blue-600"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      {/** Total members from all communities */}
                      {/* Adjust if necessary */}
                      {`${
                        allPosts.reduce((acc, post) => acc, 0) // Dummy value if you need to compute members differently
                      } members`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                        className="text-blue-600"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M7 7h.01" />
                        <path d="M12 7h.01" />
                        <path d="M17 7h.01" />
                        <path d="M7 12h.01" />
                        <path d="M12 12h.01" />
                        <path d="M17 12h.01" />
                        <path d="M7 17h.01" />
                        <path d="M12 17h.01" />
                        <path d="M17 17h.01" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{allPosts.length} communities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                        className="text-blue-600"
                      >
                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                        <path d="M10 2c1 .5 2 2 2 5" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Created in 2023</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Posts List */}
            <div className="order-2 w-full md:w-[70%]">
              <div className="bg-white rounded-lg shadow p-4">
                {loading ? (
                  <p>Loading posts...</p>
                ) : (
                  <div className="space-y-4">
                    {allPosts.map((post) => (
                      <div
                        key={post.id}
                        className="border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {post.title.charAt(0)}
                          </div>
                          <Link
                            href={`/community/${post.communityId}`}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {post.communityName}
                          </Link>
                          <span className="text-gray-500 text-sm">• {post.timeAgo}</span>
                        </div>
                        <Link href={`/community/${post.communityId}/post/${post.id}`}>
                          <h3 className="text-lg font-medium text-blue-600 mb-2">{post.title}</h3>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          {post.image && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-[90%] h-56 object-cover mx-auto rounded-xl"
                              />
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
                            <span>{post.comments?.length || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
