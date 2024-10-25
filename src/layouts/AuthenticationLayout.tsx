import React, { useCallback } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
export default function AuthenticationLayout() {


  const getRandomPastelColor = useCallback((type?: string) => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
      const lightness = Math.floor(Math.random() * 20) + 70; // 70-90%
    if (type === "title") {
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else {
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
  }, []);

  const getRandomColor = (type?: string) => {
    const color = getRandomPastelColor(type);
    return color.slice(4, -1).split(',').map(x => parseInt(x)).reduce((a, b) => (a << 8) + b, 0).toString(16).padStart(6, '0');
  };
  const bgColor = getRandomColor();
    const textColor = getRandomColor("title");
  const matches = useMatches();
  const pageName = (matches[matches.length - 1]?.handle as { title: string })?.title || 'Authentication';

  React.useEffect(() => {
    document.title = pageName;
  }, [pageName]);



  const backgroundImage = `https://placehold.co/600x400/${bgColor}/${textColor}?text=${pageName}`;

  return (
    <div className="w-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <img
          src={backgroundImage}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale transition-all duration-300"
        />
      </div>
      <div className="flex items-center justify-center py-12 overflow-y-auto  h-screen">
        <Outlet />
      </div>
    </div>
  );
}