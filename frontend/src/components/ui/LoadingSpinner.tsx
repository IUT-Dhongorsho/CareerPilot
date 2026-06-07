import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 40, color = '#6366f1', fullScreen = false }: LoadingSpinnerProps) {
  const spinner = <ClipLoader color={color} size={size} />;
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm z-50"
      >
        {spinner}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500 }}
      className="flex justify-center py-8"
    >
      {spinner}
    </motion.div>
  );
}
