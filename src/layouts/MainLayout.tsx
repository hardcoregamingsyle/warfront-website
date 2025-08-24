import { VerificationBanner } from "@/components/VerificationBanner";
import { useAuth } from "@/hooks/use-auth";
import React from "react";
import { useLocation, Link } from "react-router";

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

    return (
        <div>
            <VerificationBanner />
            <main>
                {isUnverified && !isAllowedPage ? <UnverifiedAccessMessage /> : children}
            </main>
        </div>
    );
};