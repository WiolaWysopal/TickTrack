import { useEffect, useRef } from 'react';

interface AdSenseProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export function AdSense({ position = 'top', className = '' }: AdSenseProps) {
  const adRef = useRef<HTMLElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Wait for the container to be properly sized
    const timer = setTimeout(() => {
      if (isInitialized.current || !adRef.current) {
        return;
      }

      try {
        // Only push new ad if container is visible and has dimensions
        const container = adRef.current.parentElement;
        if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('Error initializing AdSense:', error);
      }
    }, 100); // Small delay to ensure container is ready

    return () => {
      clearTimeout(timer);
      isInitialized.current = false;
    };
  }, []);

  // Only show bottom ad on mobile
  if (position === 'bottom') {
    return (
      <div className="md:hidden">
        <div 
          className={`ad-container fixed bottom-0 left-0 right-0 bg-white shadow-up z-40 ${className}`}
          style={{ 
            width: '100%',
            minHeight: '50px',
            height: 'auto',
            maxHeight: '100px'
          }}
        >
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              minHeight: '50px',
              maxHeight: '100px'
            }}
            data-ad-client="ca-pub-1233774104351134"
            data-ad-slot="5784585816"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Top ad - responsive for all screen sizes
  return (
    <div 
      className={`ad-container bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
      style={{ 
        width: '100%',
        minHeight: '90px',
        height: 'auto',
        maxHeight: '280px'
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: '90px',
          maxHeight: '280px'
        }}
        data-ad-client="ca-pub-1233774104351134"
        data-ad-slot="5784585816"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}