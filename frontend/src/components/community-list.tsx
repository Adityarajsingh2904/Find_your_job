import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Community } from "@/app/community/page";

interface CommunityListProps {
  communities: Community[];
  onJoin: (community: Community) => void;
  onLeave: (community: Community) => void;
  joinedCommunityIds: string[];
}

export default function CommunityList({
  communities,
  onJoin,
  onLeave,
  joinedCommunityIds,
}: CommunityListProps) {
  return (
    <div className="space-y-4">
      {communities.map((community) => {
        const isJoined = joinedCommunityIds.includes(community.communityId);
        return (
          <div
            key={community.communityId}
            className="flex items-center justify-between border-b border-blue-100 pb-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {community.communityName.charAt(0)}
              </div>
              <div>
                <Link
                  href={`/community/${community.communityId}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  {community.communityName}
                </Link>
                <p className="text-sm text-gray-500">
                  {community.memberCount} members
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                isJoined ? onLeave(community) : onJoin(community)
              }
              className={
                isJoined
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  : "bg-blue-50 text-blue-600 border border-blue-300 hover:bg-blue-200"
              }
            >
              {isJoined ? "Joined" : "Join"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
