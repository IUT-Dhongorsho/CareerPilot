import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function SimpleLottie() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Loading Lottie from /animations/background.json');
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/animations/background.json',
    });

    animation.addEventListener('data_ready', () => {
      console.log('Lottie animation loaded');
    });
    animation.addEventListener('error', (err) => {
      console.error('Lottie error:', err);
    });

    return () => animation.destroy();
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10 w-full h-full" />;
}
