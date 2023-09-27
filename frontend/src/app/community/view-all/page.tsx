"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getIdTokenNoParam } from "@/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
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
  posts?: any[];
}

interface CommunitiesApiResponse {
  message: string;
  communities: Community[];
  count: number;
  nextCursor: string;
  hasMore: boolean;
}

export default function CommunitiesPage() {
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [notJoinedCommunities, setNotJoinedCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
      } catch (error) {
        toast.error("Error fetching communities");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCommunities();
  }, []);

  // Fetch joined communities for the current user
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
        const joined: Community[] = Array.isArray(data)
          ? data.map((comm: Community) => comm)
          : data.communities;
        setJoinedCommunities(joined);
      } catch (error) {
        toast.error("Error fetching joined communities");
      }
    };
    fetchJoinedCommunities();
  }, []);

  // When search term is empty, update not joined communities from local data
  useEffect(() => {
    if (searchTerm.trim() === "") {
      const joinedIds = new Set(joinedCommunities.map((c) => c.communityId));
      setNotJoinedCommunities(allCommunities.filter((c) => !joinedIds.has(c.communityId)));
    }
  }, [searchTerm, allCommunities, joinedCommunities]);

  // API search function for NOT joined communities only
  const searchNotJoinedCommunities = async (term: string): Promise<void> => {
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
      const searchResults: Community[] = data.results || data.communities || [];
      // Only include communities not already joined
      const joinedIds = new Set(joinedCommunities.map((c) => c.communityId));
      const notJoinedResults = searchResults.filter((c) => !joinedIds.has(c.communityId));
      setNotJoinedCommunities(notJoinedResults);
    } catch (error) {
      toast.error("Error searching communities");
      setNotJoinedCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search for NOT joined communities via API
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const timeout = setTimeout(() => {
        searchNotJoinedCommunities(searchTerm);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [searchTerm, joinedCommunities]);

  // Local filtering for joined communities when searching
  const displayedJoinedCommunities =
    searchTerm.trim() === ""
      ? joinedCommunities
      : joinedCommunities.filter((c) =>
          c.communityName.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Functions to join and leave communities
  const joinCommunity = async (community: Community): Promise<void> => {
    try {
      const formData = new FormData();
      const idToken = await getIdTokenNoParam();
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      formData.append("userId", currentUser.uid);
      formData.append("communityId", community.communityId);
      formData.append("communityName", community.communityName);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/join`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        }
      );
      if (!res.ok) toast.error("Failed to join community");
      const data = await res.json();
      // Update joined communities list locally
      setJoinedCommunities((prev) => [...prev, community]);
      // Also remove the joined community from not joined list if present
      setNotJoinedCommunities((prev) =>
        prev.filter((c) => c.communityId !== community.communityId)
      );
      toast.success("Joined community successfully");
    } catch (error) {
      toast.error("Error joining community");
    }
  };

  const leaveCommunity = async (community: Community): Promise<void> => {
    try {
      const formData = new FormData();
      const idToken = await getIdTokenNoParam();
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      formData.append("userId", currentUser.uid);
      formData.append("communityId", community.communityId);
      formData.append("communityName", community.communityName);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/community/leave`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        }
      );
      if (!res.ok) toast.error("Failed to leave community");
      const data = await res.json();
      // Remove the community from joined list
      setJoinedCommunities((prev) =>
        prev.filter((c) => c.communityId !== community.communityId)
      );
      // Optionally, add it back to not joined list if it matches current search/filter
      if (
        searchTerm.trim() === "" ||
        community.communityName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        setNotJoinedCommunities((prev) => [...prev, community]);
        toast.success("Left community successfully");
      }
    } catch (error) {
      toast.error("Error leaving community");
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Communities</h1>
          <p className="text-blue-600/80">
            Browse and join communities that interest you.
          </p>
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500/50" />
            <Input
              type="search"
              placeholder="Search communities..."
              className="pl-8 border-blue-200 focus-visible:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
        </div>
        {/* Joined and Not Joined Sections */}
        <div className="flex flex-col gap-6">
          {/* Joined Communities */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Joined Communities
            </h2>
            {displayedJoinedCommunities.length === 0 ? (
              <p>You have not joined any communities yet.</p>
            ) : (
              <div className="space-y-4">
                {displayedJoinedCommunities.map((community) => (
                  <div
                    key={community.communityId}
                    className="flex items-center justify-between border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
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
                    <Button
                      className="bg-red-200 hover:bg-red-500 hover:text-white text-red-700"
                      onClick={() => leaveCommunity(community)}
                    >
                      Leave
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Other (Not Joined) Communities */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Other Communities
            </h2>
            {notJoinedCommunities.length === 0 ? (
              <p>No communities found.</p>
            ) : (
              <div className="space-y-4">
                {notJoinedCommunities.map((community) => (
                  <div
                    key={community.communityId}
                    className="flex items-center justify-between border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
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
                    <Button
                      className="bg-blue-200 border border-blue-400 hover:bg-blue-400 hover:text-white text-blue-700"
                      onClick={() => joinCommunity(community)}
                    >
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
