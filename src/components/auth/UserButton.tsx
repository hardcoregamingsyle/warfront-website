"use client";
/**
 * Contains the user profile, dropdown menu, and logout button
 */

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth"; // Assuming you have an auth hook
import { motion } from "framer-motion"; // Import motion from framer-motion
import {
  LogOut,
  User,
  Settings,
  History,
  Trash2,
  Swords,
  Shield,
} from "lucide-react"; // Import icons
import { useState } from "react"; // Import useState for dialog state
import { useNavigate } from "react-router";

interface UserButtonProps {
  className?: string;
  size?: number; // Add size prop for configurable dimensions
}

export function UserButton({ className, size = 8 }: UserButtonProps) {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Convert size prop to pixel value for inline styles
  const sizeInPixels = size * 4; // Tailwind size-8 = 2rem = 32px (4px × 8)

  // Open confirmation dialog
  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  // Handle confirmed sign out and redirect
  const handleConfirmedSignOut = async () => {
    signOut();
    navigate("/"); // Redirect to index page after sign out
    setShowSignOutConfirm(false);
  };

  // Cancel sign out
  const handleCancelSignOut = () => {
    setShowSignOutConfirm(false);
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmedDeleteAccount = () => {
    // TODO: Implement account deletion logic
    console.log("Deleting account...");
    setShowDeleteConfirm(false);
    signOut();
    navigate("/");
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  // Show loading state when authentication is being checked
  if (isLoading) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center justify-center relative rounded-full ${className}`}
      >
        <Button
          variant="ghost"
          className={`p-0 rounded-full shadow-sm border border-primary/20`}
          style={{ height: `${sizeInPixels}px`, width: `${sizeInPixels}px` }}
        >
          <Avatar
            style={{ height: `${sizeInPixels}px`, width: `${sizeInPixels}px` }}
          >
            <img
              src="/favicon_crack.png"
              alt="Logo"
              style={{
                height: `${sizeInPixels}px`,
                width: `${sizeInPixels}px`,
              }}
            />
          </Avatar>
        </Button>
      </motion.div>
    );
  }

  if (!user || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center justify-center relative rounded-full ${className}`}
          >
            <Button
              variant="ghost"
              className={`p-0 rounded-full shadow-sm border border-primary/20`}
              style={{
                height: `${sizeInPixels}px`,
                width: `${sizeInPixels}px`,
              }}
            >
              <Avatar
                style={{
                  height: `${sizeInPixels}px`,
                  width: `${sizeInPixels}px`,
                }}
              >
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    height: `${sizeInPixels}px`,
                    width: `${sizeInPixels}px`,
                  }}
                />
              </Avatar>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[9999] w-56">
          {/* User info section */}
          <div className="px-2 py-1.5 flex flex-col gap-0.5 border-b mb-1 pb-2">
            <p className="font-medium text-sm">{user.name || "User"}</p>
            <p className="text-muted-foreground text-xs truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/inventory")}
          >
            <Swords className="h-4 w-4" />
            <span>Inventory</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/trade-history")}
          >
            <History className="h-4 w-4" />
            <span>Trade History</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/battle-history")}
          >
            <Shield className="h-4 w-4" />
            <span>Battle History</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleSignOutClick}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
            onClick={handleDeleteAccountClick}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleCancelSignOut}>
              Cancel
            </Button>
            <Button onClick={handleConfirmedSignOut}>Yes, Sign Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleCancelDeleteAccount}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmedDeleteAccount}
            >
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}