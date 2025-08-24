import { Protected } from "@/lib/protected-page";
import { MainLayout } from "./MainLayout";
import React from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    return (
        <Protected>
            <MainLayout>
                {children}
            </MainLayout>
        </Protected>
    );
};
