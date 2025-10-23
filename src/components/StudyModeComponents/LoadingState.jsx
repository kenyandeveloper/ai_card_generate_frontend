import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center h-screen flex-col gap-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Brain className="w-10 h-10 text-primary" />
      </motion.div>
      <p className="text-xl text-text-muted font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
