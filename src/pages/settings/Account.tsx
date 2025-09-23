import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditFieldDialog from "@/components/settings/EditFieldDialog";
import type { Role } from "@/convex/schema";
import { ROLES } from "@/convex/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditableField = "Username" | "Display Name" | "Region" | "Date of Birth" | "Profile Picture" | "Role";

export default function AccountSettings() {
  const { token } = useAuth();
  const userSettings = useQuery(api.users.getCurrentUserSettings, token ? { token } : "skip");
  const updateSettings = useMutation(api.users.updateAccountSettings);
  const setRole = useMutation(api.users.setUserRole);

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const handleSave = async (field: EditableField, newValue: string | { storageId: Id<"_storage"> }) => {
    // Handle role separately with secure backend mutation (no password required)
    if (field === "Role") {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await setRole({ token, role: newValue as Role });
        toast.success(`Role updated successfully`);
        setEditingField(null);
      } catch (error: any) {
        toast.error(error.data || `Failed to update role`);
      }
      return;
    }

    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const payload: any = { token };
    if (field === "Username") {
      payload.username = newValue as string;
    } else if (field === "Display Name") {
      payload.displayName = newValue as string;
    } else if (field === "Region") {
      payload.region = newValue as string;
    } else if (field === "Date of Birth") {
      payload.dob = newValue as string;
    } else if (field === "Profile Picture") {
      if (typeof newValue === "object" && "storageId" in newValue) {
        payload.storageId = newValue.storageId;
      } else {
        payload.image = newValue as string;
      }
    }

    try {
      await updateSettings(payload);
      toast.success(`${field} updated successfully`);
    } catch (error: any) {
      toast.error(error.data || `Failed to update ${field}`);
    }
  };

  const renderField = (label: EditableField, value: string | undefined, inputType: string = "text") => (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-white font-medium">{value || "Not set"}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setEditingField(label)}>
        <Pencil className="h-4 w-4 text-slate-400" />
      </Button>
    </div>
  );

  if (userSettings === undefined) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Account Settings - Warfront</title>
      </Helmet>
      <div className="bg-black min-h-screen -m-10 p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-400 mb-8">Account Settings</h1>
          
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userSettings?.image || undefined} alt={userSettings?.name || ""} />
                    <AvatarFallback>{userSettings?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-slate-400">Profile Picture</p>
                    <p className="text-white font-medium">Update your avatar</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingField("Profile Picture")}>
                  <Pencil className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              {renderField("Username", userSettings?.name)}
              {renderField("Display Name", userSettings?.displayName)}
              {renderField("Region", userSettings?.region)}
              {renderField("Date of Birth", userSettings?.dob, "date")}

              {
                /* Role (visible only if verified admin email) */
              }
              {userSettings?.emailVerified &&
                userSettings?.email?.toLowerCase() === "hardcorgamingstyle@gmail.com" &&
                (
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">Role</p>

                      {/* If editing Role, show dropdown without password */}
                      {editingField === "Role" ? (
                        <div className="mt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
                          <Select
                            value={(selectedRole ?? (userSettings?.role as Role | null) ?? null) as any || undefined}
                            onValueChange={(val) => setSelectedRole(val as Role)}
                          >
                            <SelectTrigger className="w-full sm:w-64 bg-slate-900 border-slate-700">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                              <SelectItem value={ROLES.OWNER}>Owner</SelectItem>
                              <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                              <SelectItem value={ROLES.CARD_SETTER}>Card Setter</SelectItem>
                              <SelectItem value={ROLES.BLOGGERS}>Blogger</SelectItem>
                              <SelectItem value={ROLES.INFLUENCER}>Influencer</SelectItem>
                              <SelectItem value={ROLES.VERIFIED}>Verified</SelectItem>
                              <SelectItem value={ROLES.UNVERIFIED}>Unverified</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const toSave = (selectedRole ?? (userSettings?.role as Role | undefined));
                                if (!toSave) {
                                  toast.error("Please select a role");
                                  return;
                                }
                                handleSave("Role", toSave); // No password required
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Save
                            </Button>
                            <Button variant="ghost" onClick={() => { setEditingField(null); setSelectedRole(null); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white font-medium">{userSettings?.role || "Not set"}</p>
                      )}
                    </div>

                    {editingField !== "Role" && (
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedRole((userSettings?.role as Role | null) ?? null);
                        setEditingField("Role");
                      }}>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                )
              }

            </CardContent>
          </Card>
        </div>
      </div>

      {editingField && editingField !== "Role" && (
        <EditFieldDialog
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          fieldName={editingField}
          currentValue={
            (editingField === "Username" ? userSettings?.name :
            editingField === "Display Name" ? userSettings?.displayName :
            editingField === "Region" ? userSettings?.region :
            editingField === "Date of Birth" ? userSettings?.dob :
            editingField === "Profile Picture" ? userSettings?.image :
            "") || ""
          }
          onSave={(value) => handleSave(editingField, value)}
          inputType={editingField === "Date of Birth" ? "date" : "text"}
        />
      )}
    </DashboardLayout>
  );
}