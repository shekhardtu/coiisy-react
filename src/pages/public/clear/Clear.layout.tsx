import { useCallback, useEffect, useRef } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const LostPage = () => {
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);

  const redirectToHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progress = ((duration - remaining) / duration) * 100;

      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
      if (countdownRef.current) {
        countdownRef.current.textContent = Math.ceil(remaining / 1000).toString();
      }
      if (remaining <= 0) {
        redirectToHome();
      }
    };

    const interval = setInterval(updateProgress, 16);
    return () => clearInterval(interval);
  }, [redirectToHome]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          {/* Lost Icon */}
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900 animate-pulse">
            <svg
              className="w-8 h-8 text-yellow-500 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Oops! You seem to be lost
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting to home page in <span ref={countdownRef} className="font-bold">5</span> seconds
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-yellow-500 dark:bg-yellow-400 transition-all duration-100 ease-linear"
              style={{ width: '0%' }}
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={redirectToHome}
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600
                       rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
                       focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-800"
            >
              Go to Home Page Now
            </button>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
                       hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ease-in-out"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClearLayout = () => {
  const { sessionId } = useParams();

  if (!sessionId) {
    return <LostPage />;
  }

  return <Outlet />;
};

export default ClearLayout;