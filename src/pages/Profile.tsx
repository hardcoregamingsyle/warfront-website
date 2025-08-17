import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  // Validate userId before passing to the query
  const profile = useQuery(
    api.users.getUserProfile,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12" />
      </div>
    );
  }

  if (profile === null) {
    return <div>User not found</div>;
  }

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <img
            src={profile.image || "/assets/default-avatar.png"}
            alt={profile.name}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName || profile.name}</h1>
            <p className="text-muted-foreground">@{profile.name}</p>
          </div>
        </div>
        <div className="mt-4">
          {isOwnProfile ? (
            <Button>Edit Profile</Button>
          ) : (
            <Button>Add Friend</Button>
          )}
        </div>
      </div>
    </div>
  );
}