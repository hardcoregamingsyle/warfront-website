import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Crown, Users, Wrench, TestTube, Scroll } from "lucide-react";

interface RoleSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

const roles = [
  {
    value: "admin",
    label: "Admin",
    description: "Full system access and user management",
    icon: Crown,
    color: "text-yellow-400"
  },
  {
    value: "staff",
    label: "Staff",
    description: "Moderate users and manage content",
    icon: Shield,
    color: "text-blue-400"
  },
  {
    value: "cardsetter",
    label: "Card Setter",
    description: "Create and manage game cards",
    icon: Scroll,
    color: "text-purple-400"
  },
  {
    value: "test",
    label: "Tester",
    description: "Test new features and report bugs",
    icon: TestTube,
    color: "text-green-400"
  },
  {
    value: "user",
    label: "Regular User",
    description: "Standard player access",
    icon: User,
    color: "text-gray-400"
  }
];

export default function RoleSelectionDialog({ open, onClose, token }: RoleSelectionDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setUserRole = useMutation(api.users.setUserRole);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsSubmitting(true);
    try {
      await setUserRole({ token, role: selectedRole as any });
      toast.success("Role assigned successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-red-400">Select Your Role</DialogTitle>
          <DialogDescription className="text-slate-300">
            As an admin account, please choose your role in the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.value}
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === role.value
                    ? "border-red-500 bg-slate-700"
                    : "border-slate-600 bg-slate-800 hover:border-slate-500"
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className={`h-5 w-5 ${role.color}`} />
                    {role.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-slate-400">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Assigning..." : "Confirm Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
