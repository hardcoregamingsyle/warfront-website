import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const users = useQuery(api.users.searchUsers, { search: searchQuery });

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold tracking-tight text-red-500 mb-4">
            Find Users
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Search for other commanders on the platform.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {users === undefined && searchQuery && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          )}
          {users && users.length === 0 && searchQuery && (
            <p className="text-center text-slate-400">No users found.</p>
          )}
          <div className="grid grid-cols-1 gap-4">
            {users?.map((user) => (
              <Link to={`/profile/${user._id}`} key={user._id}>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-slate-900/50 border-slate-700 hover:border-red-500/40 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-white">{user.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
