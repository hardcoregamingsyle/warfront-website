import { motion } from "framer-motion";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Warfront</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen px-4"
      >
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-6" aria-hidden="true" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold text-red-500">404</h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-white">Mission Failed</h2>
            <p className="text-xl text-slate-300 max-w-md mx-auto">
              The battlefield you're looking for has been evacuated or never existed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" aria-label="Return to home">
                <Home className="mr-2 h-5 w-5" aria-hidden="true" />
                Return to Base
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.history.back()}
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
              Retreat
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
