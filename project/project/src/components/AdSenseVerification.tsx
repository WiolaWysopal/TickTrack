import { useEffect } from 'react';

export function AdSenseVerification() {
  useEffect(() => {
    // Push the ad after component mounts
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error) {
      console.error('Error initializing AdSense:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">TickTrack</h1>
        <p className="text-gray-600 mb-4">
          This page is for Google AdSense verification purposes.
        </p>
        {/* Add an AdSense ad unit */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1233774104351134"
          data-ad-slot="5784585816"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}