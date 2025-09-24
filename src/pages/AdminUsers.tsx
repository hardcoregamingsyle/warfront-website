import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

type UserRow = {
  _id: Id<"users">;
  name: string;
  displayName?: string;
  region?: string;
  email: string;
  email_normalized: string;
  role?: string;
  image?: string;
};

const ROLES = [
  "Unverified",
  "Verified",
  "Influencer",
  "Admin",
  "Owner",
  "Card Setter",
  "Bloggers",
] as const;

export default function AdminUsers() {
  const { user, token } = useAuth();

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const users = useQuery(
    api.users.listAllUsers,
    token && isAuthorized ? { token } : "skip"
  );

  const setUserRole = useMutation(api.users.adminSetUserRole);
  const resetPassword = useMutation(api.users.adminResetPassword);
  const deleteUser = useMutation(api.users.adminDeleteUser);

  const [passwords, setPasswords] = useState<Record<string, string>>({}); // per-user new password
  const [hiddenIds, setHiddenIds] = useState<Record<string, true>>({});

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const visibleUsers = useMemo(() => {
    return sortedUsers.filter((u) => !hiddenIds[u._id]);
  }, [sortedUsers, hiddenIds]);

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-24">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">You are not authorized to view this page.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (users === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const handleRoleChange = async (userId: Id<"users">, role: (typeof ROLES)[number]) => {
    if (!token) return;
    const t = toast.loading("Updating role...");
    try {
      await setUserRole({ token, userId, role });
      toast.success("Role updated", { id: t });
    } catch (e: any) {
      toast.error(e.message || "Failed to update role", { id: t });
    }
  };

  const handlePasswordReset = async (userId: Id<"users">) => {
    if (!token) return;
    const newPass = passwords[userId] || "";
    const t = toast.loading("Resetting password...");
    try {
      await resetPassword({ token, userId, newPassword: newPass });
      setPasswords((s) => ({ ...s, [userId]: "" }));
      toast.success("Password reset", { id: t });
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password", { id: t });
    }
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (!token) return;
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    const t = toast.loading("Deleting user...");
    try {
      setHiddenIds((s) => ({ ...s, [userId]: true }));
      await deleteUser({ token, userId });
      toast.success("User deleted", { id: t });
    } catch (e: any) {
      setHiddenIds((s) => {
        const { [userId]: _removed, ...rest } = s;
        return rest;
      });
      toast.error(e.message || "Failed to delete user", { id: t });
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Admin • Users | Warfront</title>
        <link rel="icon" type="image/png" href="/assets/Logo.png" />
      </Helmet>

      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold text-red-400 mb-6">Manage Users</h1>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/70 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Region</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Set New Password</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u: UserRow) => (
                <tr key={u._id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.region ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Select
                      defaultValue={u.role ?? ROLES[0]}
                      onValueChange={(val) => handleRoleChange(u._id, val as (typeof ROLES)[number])}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="New password"
                        className="w-48"
                        value={passwords[u._id] ?? ""}
                        onChange={(e) =>
                          setPasswords((s) => ({ ...s, [u._id]: e.target.value }))
                        }
                      />
                      <Button
                        size="icon"
                        onClick={() => handlePasswordReset(u._id)}
                        title="Save new password"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(u._id)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}