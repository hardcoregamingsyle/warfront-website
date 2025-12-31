import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Swords, Shield, Users, Trophy, FilePlus2, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useCallback, memo } from "react";

const QuickActionCard = memo(({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  href, 
  onClick 
}: {
  icon: any;
  title: string;
  description: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="bg-slate-900/50 border-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{description}</p>
        {href ? (
          <Link to={href}>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" aria-label={buttonText}>
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={onClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            aria-label={buttonText}
          >
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  </motion.div>
));

QuickActionCard.displayName = "QuickActionCard";

export default function Dashboard() {
  const { user, token } = useAuth();
  const createCard = useMutation(api.cards.createCardWithId);
  const navigate = useNavigate();

  const handleCreateCard = useCallback(async () => {
    if (!token) {
      toast.error("You must be logged in to create a card.");
      return;
    }
    
    const customId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 8);
    
    const toastId = toast.loading("Creating new card...");
    try {
      const cardId = await createCard({ token, customId });
      toast.success("New card created! Redirecting to editor...", { id: toastId });
      navigate(`/cards/${cardId}`);
    } catch (error) {
      toast.error("Failed to create new card.", { id: toastId });
      console.error(error);
    }
  }, [token, createCard, navigate]);

  const isPrivilegedUser = user && ["admin", "owner", "cardsetter"].includes(user.role!);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Warfront Dashboard</title>
        <link rel="icon" type="image/png" href="/assets/Untitled_design.png" />
        <meta name="description" content="Your personal Warfront dashboard. View your card collection, track your player stats, manage your account, and jump into a match." />
      </Helmet>
      <div className="text-white -m-8 p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold tracking-tight text-red-500 mb-4">
              Command Center
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Welcome to your military headquarters. Deploy your forces, manage your arsenal, and dominate the battlefield.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={Swords}
              title="Quick Battle"
              description="Jump into combat immediately"
              buttonText="Deploy Now"
              href="/join-battle"
            />

            <QuickActionCard
              icon={Shield}
              title="Inventory"
              description="Manage your weapons and gear"
              buttonText="View Inventory"
              href="/inventory"
            />

            <QuickActionCard
              icon={Users}
              title="Multiplayer"
              description="Challenge other commanders"
              buttonText="Find Match"
              href="/multi_battle"
            />

            <QuickActionCard
              icon={Trophy}
              title="Tournaments"
              description="Compete for glory and rewards"
              buttonText="Enter Arena"
              href="/competitive"
            />
            
            {isPrivilegedUser && (
              <>
                <QuickActionCard
                  icon={FilePlus2}
                  title="Create Card"
                  description="Design a new digital card"
                  buttonText="Create New"
                  onClick={handleCreateCard}
                />
                <QuickActionCard
                  icon={Library}
                  title="View All Cards"
                  description="Browse the entire card collection"
                  buttonText="Browse Collection"
                  href="/all-cards"
                />
              </>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center py-8">
            <Card className="bg-gradient-to-r from-red-900/20 to-slate-900/20 border-red-500/30">
              <CardContent className="py-8">
                <h2 className="text-3xl font-bold text-red-400 mb-4">Ready for Your First Battle?</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Your military campaign awaits. Choose your strategy, deploy your forces, and claim victory on the battlefield.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/how-to-play">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                      Start Tutorial
                    </Button>
                  </Link>
                  <Link to="/join-battle">
                    <Button size="lg" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10 px-8">
                      Join Battle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}