import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  currentValue: string;
  onSave: (
    value: string | { storageId: Id<"_storage"> },
    password_confirmation: string
  ) => Promise<void>;
  inputType?: string;
}

export default function EditFieldDialog({
  isOpen,
  onClose,
  fieldName,
  currentValue,
  onSave,
  inputType = "text",
}: EditFieldDialogProps) {
  const [newValue, setNewValue] = useState(currentValue);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  useEffect(() => {
    setNewValue(currentValue);
    setPreviewUrl(currentValue);
    setSelectedFile(null);
  }, [isOpen, currentValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (fieldName === "Profile Picture" && selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        await onSave({ storageId }, password);
      } else {
        await onSave(newValue, password);
      }
      setPassword("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit {fieldName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {fieldName === "Profile Picture" ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback>PFP</AvatarFallback>
                </Avatar>
                <Input
                  id="pfp-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-slate-800 border-slate-600 file:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-400">
                    Or
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="newValue">Paste image URL</Label>
                <Input
                  id="newValue"
                  type="text"
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value);
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  className="bg-slate-800 border-slate-600 mt-1"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="newValue">{fieldName}</Label>
              <Input
                id="newValue"
                type={inputType}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Confirm Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-600"
              placeholder="Enter password to confirm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}