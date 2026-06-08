import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { motion } from 'framer-motion';

interface Props {
  animationData: object;
  className?: string;
}

export default function LottieCharacter({ animationData, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      animationData,
      loop: true,
      autoplay: true,
    });
    return () => anim.destroy();
  }, [animationData]);

  return (
    <motion.div
      ref={containerRef}
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    />
  );
}
