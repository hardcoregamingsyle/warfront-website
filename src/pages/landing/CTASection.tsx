import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

export default function CTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900/20 to-slate-900/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready for Battle?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of commanders already dominating the battlefield.
            Your military campaign starts now.
          </p>
          <div className="flex justify-center">
            <AuthButton
              trigger={
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Start Your Campaign
                </Button>
              }
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
