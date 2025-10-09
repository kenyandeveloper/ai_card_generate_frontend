import { motion } from "framer-motion";
import { Clock, Zap, Play } from "lucide-react";

const QuickStudyCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-xl overflow-hidden relative"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Clock size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Quick Study</h3>
        </div>

        {/* Content */}
        <p className="text-white/90 mb-6 leading-relaxed">
          Ready for a quick study session? Choose a deck to review and improve
          your mastery.
        </p>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-white/80" />
            <span className="text-sm text-white/80">Smart card selection</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-white/80" />
            <span className="text-sm text-white/80">5–15 minute sessions</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/30">
          <Play size={20} />
          <span>Start Studying</span>
        </button>
      </div>
    </motion.div>
  );
};

export default QuickStudyCard;
