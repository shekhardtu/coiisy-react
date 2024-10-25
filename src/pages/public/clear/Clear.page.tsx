import { local } from '@/lib/utils';
import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ClearSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const progressRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);

  const clearAndNavigate = useCallback(() => {
    local("json", "key").clear();
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {

    if (!sessionId) {
      clearAndNavigate();
      return;
    }

    const duration = 5000;
    const startTime = Date.now();
    const progressElement = progressRef.current;
    const countdownElement = countdownRef.current;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progress = ((duration - remaining) / duration) * 100;

      if (progressElement) {
        progressElement.style.width = `${progress}%`;
      }

      if (countdownElement) {
        countdownElement.textContent = Math.ceil(remaining / 1000).toString();
      }

      if (remaining <= 0) {
        clearAndNavigate();
      }
    };

    // Initial update
    updateProgress();

    const interval = setInterval(updateProgress, 16); // ~60fps for smooth animation

    return () => clearInterval(interval);
  }, [sessionId, clearAndNavigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="w-8 h-8 text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Session Cleared Successfully
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting to home page in <span ref={countdownRef} className="font-bold">{countdownRef.current?.textContent}</span> seconds
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-100 ease-linear"
              style={{ width: '0%' }}
            />
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div
              onClick={clearAndNavigate}
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600
                         rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Clear and Go to Home Page Now
            </div>
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

export default ClearSession;