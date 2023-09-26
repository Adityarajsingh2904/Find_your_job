"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommunityList from "@/components/community-list";
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

interface CommunitiesApiResponse {
  message: string;
  communities: Community[];
  count: number;
  nextCursor: string;
  hasMore: boolean;
}

export default function HomePage() {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [displayCommunities, setDisplayCommunities] = useState<Community[]>([]);
  // joinedPosts will now be an array of posts augmented with communityId.
  const [joinedPosts, setJoinedPosts] = useState<(Post & { communityId: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Track joined community IDs
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const router = useRouter();

  // Fetch all communities on mount
  useEffect(() => {
    const fetchAllCommunities = async (): Promise<void> => {
      setLoading(true);
      try {
        const idToken = await getIdTokenNoParam();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) toast.error("Failed to fetch communities");
        const data: CommunitiesApiResponse = await res.json();
        const communities = data.communities || [];
        setAllCommunities(communities);
        setDisplayCommunities(communities);
      } catch (error) {
        toast.error("Error fetching communities");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCommunities();
  }, []);

  // Fetch joined communities for the current user on mount
  useEffect(() => {
    const fetchJoinedCommunities = async (): Promise<void> => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;
        const idToken = await getIdTokenNoParam();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/joined/${currentUser.uid}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) toast.error("Failed to fetch joined communities");
        const data = await res.json();
        // Adjust the mapping based on your API response format.
        const joinedIds: string[] = Array.isArray(data)
          ? data.map((community: Community) => community.communityId)
          : data.communities.map((community: Community) => community.communityId);
        setJoinedCommunityIds(joinedIds);
      } catch (error) {
        toast.error("Error fetching joined communities");
      }
    };
    fetchJoinedCommunities();
  }, []);

  // Fetch joined posts for the current user on mount (Recent Posts)
  useEffect(() => {
    const fetchJoinedPosts = async (): Promise<void> => {
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
        const data = await res.json();
        // Data is in the format: { message: "...", communities: [ { communityId, posts: [...] }, ... ] }
        const posts: (Post & { communityId: string })[] = [];
        (data.communities || []).forEach((community: any) => {
          if (community.posts && community.posts.length > 0) {
            community.posts.slice(0, 2).forEach((post: Post) => {
              posts.push({ ...post, communityId: community.communityId });
            });
          }
        });
        setJoinedPosts(posts);
      } catch (error) {
        toast.error("Error fetching joined posts");
      }
    };
    fetchJoinedPosts();
  }, []);

  // Handle search term changes (debounced)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDisplayCommunities(allCommunities);
    } else {
      const timeout = setTimeout(() => {
        searchCommunities(searchTerm);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [searchTerm, allCommunities]);

  // Search communities by name
  const searchCommunities = async (term: string): Promise<void> => {
    setLoading(true);
    try {
      const idToken = await getIdTokenNoParam();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/search?name=${encodeURIComponent(
          term
        )}&limit=5`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (!res.ok) toast.error("Failed to search communities");
      const data = await res.json();
      // Adjust based on your API response field (e.g. "results" or "communities")
      setDisplayCommunities(data.results || []);
    } catch (error) {
      toast.error("Error searching communities");
      setDisplayCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to join a community
  const joinCommunity = async (community: Community): Promise<void> => {
    try {
      const formData = new FormData();
      const idToken = await getIdTokenNoParam();
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error("User is not authenticated");
        return;
      }

      setJoinedCommunityIds((prev) => [...prev, community.communityId]);
      formData.append("userId", currentUser.uid);
      formData.append("communityId", community.communityId);
      formData.append("communityName", community.communityName);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        setJoinedCommunityIds((prev) =>
          prev.filter((id) => id !== community.communityId)
        );
        toast.error("Failed to join community");
      }
      const data = await res.json();
      toast.success("Joined community successfully");
    } catch (error) {
      toast.error("Error joining community");
    }
  };

  // Function to leave a community
  const leaveCommunity = async (community: Community): Promise<void> => {
    try {
      const formData = new FormData();
      const idToken = await getIdTokenNoParam();
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error("User is not authenticated");
        return;
      }

      setJoinedCommunityIds((prev) =>
        prev.filter((id) => id !== community.communityId)
      );
      formData.append("userId", currentUser.uid);
      formData.append("communityId", community.communityId);
      formData.append("communityName", community.communityName);
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formData
        }
      );
      if (!res.ok) {
        setJoinedCommunityIds((prev) => [...prev, community.communityId]);
        toast.error("Failed to leave community");
      }
      const data = await res.json();
      toast.success("Left community successfully");
      
    } catch (error) {
      toast.error("Error leaving community");
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-blue-600">
              BlueCollar Community
            </h1>
            <p className="text-blue-600/80">
              Find jobs and connect with other workers in your industry
            </p>
          </div>

          {/* Search and Create */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500/50" />
              <Input
                type="search"
                placeholder="Search communities..."
                className="pl-8 border-blue-200 focus-visible:ring-blue-500"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Link href="/create-community">Create Community</Link>
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Popular Communities */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  Popular Communities
                </h2>
                {loading ? (
                  <p>Loading communities...</p>
                ) : (
                  <CommunityList
                    communities={displayCommunities.slice(0, 5)}
                    onJoin={joinCommunity}
                    onLeave={leaveCommunity}
                    joinedCommunityIds={joinedCommunityIds}
                  />
                )}
              </div>

              {/* Recent Posts */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-600">
                    Recent Posts
                  </h2>
                  <Link
                    href="/community/posts"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {joinedPosts.map((post) => (
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
                          {post.title}
                        </Link>
                        <span className="text-gray-500 text-sm">
                          • {post.timeAgo}
                        </span>
                      </div>
                      <Link
                        href={`/community/${post.communityId}/post/${post.id}`}
                      >
                        <h3 className="text-lg font-medium text-blue-600 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        {post.image && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-60 object-cover rounded-lg"
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
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Trending Communities */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Trending Communities
                </h2>
                <div className="space-y-3">
                  {allCommunities
                    .sort((a, b) => b.memberCount - a.memberCount)
                    .slice(0, 3)
                    .map((community) => (
                      <div
                        key={community.communityId}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {community.communityName.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/community/${community.communityId}`}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {community.communityName}
                          </Link>
                          <p className="text-xs text-gray-500">
                            {community.memberCount} members
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Link href="/community/view-all">View All Communities</Link>
                </Button>
              </div>

              {/* About BlueCollar */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  About BlueCollar
                </h2>
                <p className="text-gray-700 mb-4">
                  BlueCollar is a community platform for blue collar workers to
                  find jobs, share experiences, and connect with others in their
                  industry.
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
                      {allCommunities.reduce((acc, c) => acc + c.memberCount, 0)}{" "}
                      members
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
                    <span className="text-gray-700">
                      {allCommunities.length} communities
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
                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                        <path d="M10 2c1 .5 2 2 2 5" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Created in 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
