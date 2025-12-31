import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { memo } from "react";

export default memo(function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900/20 to-slate-900/20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready for Battle?
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Join thousands of commanders already dominating the battlefield.
            Your military campaign starts now.
          </p>
          <div className="flex justify-center">
            <AuthButton
              trigger={
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-200">
                  <Play className="mr-2 h-6 w-6" />
                  Start Your Campaign
                </Button>
              }
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
});