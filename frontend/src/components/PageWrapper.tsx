import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`min-h-screen py-16 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {children}
      </div>
    </motion.div>
  );
};

export default PageWrapper;
