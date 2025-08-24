import { VerificationBanner } from "@/components/VerificationBanner";
import { useAuth } from "@/hooks/use-auth";
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";
import RoleSelectionDialog from "@/components/RoleSelectionDialog";

interface MainLayoutProps {
    children: React.ReactNode;
}

const UnverifiedAccessMessage = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Verify Your Account</h2>
        <p className="mb-6 text-muted-foreground">
            You need to verify your email to access this page and other features.
        </p>
        <p>
            You can still view your <Link to="/inventory" className="text-red-400 hover:underline">inventory</Link>.
        </p>
    </div>
);

export const MainLayout = ({ children }: MainLayoutProps) => {
    const { user } = useAuth();
    const location = useLocation();

    const isUnverified = user?.role === "Unverified";
    const isAllowedPage = location.pathname.startsWith('/inventory');

    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [userToken, setUserToken] = useState<string>("");

    useEffect(() => {
        if (
            user &&
            user.email === "hardcorgamingstyle@gmail.com" &&
            user.role === "Verified"
        ) {
            const token = localStorage.getItem("token");
            if (token) {
                setUserToken(token);
                setShowRoleDialog(true);
            } else {
                console.error(
                    "Admin user needs to select a role, but no session token found.",
                );
            }
        }
    }, [user]);

    const handleRoleDialogClose = () => {
        setShowRoleDialog(false);
        window.location.reload();
    };

    return (
        <div>
            <VerificationBanner />
            <RoleSelectionDialog
                open={showRoleDialog}
                onClose={handleRoleDialogClose}
                token={userToken}
            />
            <main>
                {isUnverified && !isAllowedPage ? <UnverifiedAccessMessage /> : children}
            </main>
        </div>
    );
};