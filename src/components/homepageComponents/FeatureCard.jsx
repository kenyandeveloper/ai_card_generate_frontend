// src/components/homepageComponents/FeatureCard.jsx
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function FeatureCard({
  Icon,
  title,
  description,
  locked = false,
  lockReason,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      className="relative h-full"
      whileHover={{ scale: locked ? 1.0 : 1.02, y: locked ? 0 : -5 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => locked && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Locked Badge */}
      {locked && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/80 rounded-full text-xs font-medium text-gray-300">
          <Lock className="w-3 h-3" />
          Locked
        </div>
      )}

      {/* Tooltip */}
      {locked && showTooltip && (
        <div className="absolute top-12 right-3 z-20 px-3 py-2 bg-gray-800 text-gray-100 text-sm rounded-lg shadow-lg max-w-xs whitespace-normal">
          {lockReason || "Unlock this feature by leveling up"}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 transform rotate-45" />
        </div>
      )}

      {/* Card */}
      <div
        className={`
          h-full p-6 md:p-8 flex flex-col items-center text-center
          bg-gray-900 rounded-xl border border-gray-800
          shadow-lg shadow-black/20
          transition-all duration-300
          ${
            locked
              ? "opacity-75 grayscale-[0.25] pointer-events-none"
              : "hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50"
          }
        `}
      >
        {/* Icon */}
        <div className="mb-4 md:mb-6 p-3 bg-purple-500/15 rounded-xl">
          <Icon className="w-6 h-6 text-purple-500" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h3 className="mb-2 md:mb-3 text-lg md:text-xl font-semibold text-gray-100">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  lockReason: PropTypes.string,
};
