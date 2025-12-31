import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Key, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/convex/schema";

export default function AdminUsers() {
  const { user, token } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = useQuery(api.users.listAllUsers, token ? { token } : "skip");
  const setUserRole = useMutation(api.users.adminSetUserRole);
  const resetPassword = useMutation(api.users.adminResetPassword);
  const deleteUser = useMutation(api.users.adminDeleteUser);

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const handleSetRole = async (userId: string, role: string) => {
    if (!token) return;
    try {
      await setUserRole({ token, userId: userId as any, role: role as any });
      toast.success("Role updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!token || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    try {
      await resetPassword({ token, userId: userId as any, newPassword });
      toast.success("Password reset successfully");
      setNewPassword("");
      setSelectedUserId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser({ token, userId: userId as any });
      toast.success("User deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <Helmet>
          <title>Access Denied | Warfront</title>
        </Helmet>
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

  return (
    <DashboardLayout>
      <Helmet>
        <title>User Management | Warfront Admin</title>
      </Helmet>

      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-red-400 mb-6">User Management</h1>

        <div className="space-y-4">
          {users?.map((u) => (
            <Card key={u._id} className="bg-slate-900/50 border-red-500/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-sm text-slate-400">Username</p>
                    <p className="text-white font-medium">{u.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{u.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
                    <Select
                      value={u.role || ROLES.VERIFIED}
                      onValueChange={(role) => handleSetRole(u._id, role)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedUserId(u._id)}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteUser(u._id)}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedUserId === u._id && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button
                      onClick={() => handleResetPassword(u._id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUserId(null);
                        setNewPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
