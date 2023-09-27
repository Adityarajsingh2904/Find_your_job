"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import PostItem from "@/components/post-item";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { useParams } from "next/navigation";
import CreatePost from "@/components/createPost";
import {toast} from "sonner"

// Timestamp interface for createdAt/updatedAt
interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

// Community and Post types based on your API response
interface Community {
  communityId: string;
  communityName: string;
  description: string;
  memberCount: number;
  moderator: string;
  createdAt: Timestamp;
  communityBackgroundPhoto: string;
  communityProfilePhoto: string;
  posts: Post[];
}

export interface Post {
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

export interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  dislikes: number;
}

export default function CommunityPage() {
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // Local membership state
  const [isMember, setIsMember] = useState<boolean>(false);
  // Joined community IDs for the current user
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  // New post state
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  
  // Get community id from URL params using Next 13 App Router hook
  const { id } = useParams();

  // Fetch community details
  useEffect(() => {
    async function fetchCommunityDetails() {
      setLoading(true)
      try {
        const idToken = await getIdTokenNoParam();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${idToken}` },
        });
        if (!res.ok) toast.error("Failed to fetch community details");
        const data = await res.json();
        // Assume API returns the community data under 'community'
        const resCommunity: Community = data.community;
        setCommunity(resCommunity);
        setLoading(false)
      } catch (err) {
        toast.error("Failed to load community details")
        setLoading(false)
      }
    }
    fetchCommunityDetails();
  }, [id]);

  // Fetch community posts
  useEffect(() => {
    async function fetchCommunityPosts() {
      try {
        const idToken = await getIdTokenNoParam();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/posts?communityId=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
        });
        if (!res.ok) toast.error("Failed to fetch posts. Try again later");
        const data = await res.json();
        setPosts(data.posts);
      } catch (err) {
        toast.error("Failed to load posts");
      }
    }
    fetchCommunityPosts();
  }, [id]);

  // Fetch joined communities for the current user on mount
  useEffect(() => {
    async function fetchJoinedCommunities() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;
        const idToken = await getIdTokenNoParam();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/joined/${currentUser.uid}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw toast.error("Failed to fetch joined communities. Try again later");
        const data = await res.json();
        // If API returns an array directly, use it; otherwise, use data.communities.
        const joinedIds: string[] = Array.isArray(data)
          ? data.map((c: Community) => c.communityId)
          : data.communities.map((c: Community) => c.communityId);
        setJoinedCommunityIds(joinedIds);
        
      } catch (error) {
        toast.error("Error fetching joined communities. Try again later");
      }
    }
    fetchJoinedCommunities();
  }, []);

  // Update isMember based on fetched joined community IDs and current community details
  useEffect(() => {
    if (community) {
      setIsMember(joinedCommunityIds.includes(community.communityId));
    }
  }, [community, joinedCommunityIds]);

  // Handle join/leave actions
  const handleJoinLeave = async () => {
    if (!community) return;
    const formData = new FormData();
    
    try {
      const user = await getCurrentUser();
      const userId = user?.uid;
      if (!userId) {
        toast.error("User is not authenticated");
        return;
      }
      formData.append("userId",userId)
      formData.append("communityId",community.communityId)
      formData.append("communityName", community.communityName)
      
      const idToken = await getIdTokenNoParam();
      if (isMember) {
        // Leave community
        setIsMember(false);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/leave`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`
          },
          body: formData
        });
        const data = await res.json();
        console.log(data)
        if (!res.ok) {
          setIsMember(true);
          toast.error("Failed to leave community");
        }
        
        // Optionally update joined community IDs state
        setJoinedCommunityIds((prev) => prev.filter((id) => id !== community.communityId));
        toast.success(`Successfully left ${community.communityName}`);
      } else {
        // Join community
        setIsMember(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/join`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}` 
          },
          body: formData
        });
        if (!res.ok) {
          setIsMember(false);
          toast.error("Failed to join community");
        }
        setJoinedCommunityIds((prev) => [...prev, community.communityId]);
        toast.success(`Successfully Joined ${community.communityName}`);
      }
    } catch (err) {
      toast.error("Unexpected error occured. Please refresh the page and try again");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error || !community) {
    toast.error("Failed to load community.Please try again later");
    return <div className="text-center py-10">Failed to load community</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col gap-6">
      {/* Community Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Background Image covering entire width */}
        <div className="w-full h-32">
          <img
            src={community?.communityBackgroundPhoto}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          {/* Community profile photo placed above the text */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white mb-4">
            <img
              src={community?.communityProfilePhoto}
              alt={`${community?.communityName} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-blue-600">
                  {community?.communityName}
                </h1>
                <p className="text-gray-500 text-sm">
                  {community?.memberCount} members
                </p>
              </div>
              <Button
                onClick={handleJoinLeave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isMember ? "Leave Community" : "Join Community"}
              </Button>
            </div>
            <p className="mt-4 text-gray-700">{community?.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Create Post (only visible if member) */}
          {isMember && <CreatePost communityId={community.communityId} setPosts={setPosts} />}

          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-600">Recent Posts</h2>
              <div className="text-sm text-blue-600 font-medium">
                <span className="mr-2">Sort by:</span>
                <select className="bg-transparent text-blue-600 focus:outline-none">
                  <option>Newest</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>
            {posts.length === 0 ? (
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    communityId={community.communityId}
                    communityName={community.communityName}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">
              About {community.communityName}
            </h2>
            <p className="text-gray-700 mb-4">{community.description}</p>
            <div className="space-y-3 text-sm text-gray-500">
              <p><strong>Members:</strong> {community.memberCount}</p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(community.createdAt._seconds * 1000).toLocaleDateString()}
              </p>
              <p><strong>Moderator:</strong> Blue Collar Connect</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Link to all communities */}
    </div>
  </div>
</div>

  );
}
