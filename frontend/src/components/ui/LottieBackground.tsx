import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieBackgroundProps {
  animationData: object;
}

export default function LottieBackground({ animationData }: LottieBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      animationData: animationData,
      loop: true,
      autoplay: true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    });
    return () => anim.destroy();
  }, [animationData]);

  return <div ref={containerRef} className="fixed inset-0 -z-10 w-full h-full" />;
}
