interface AuthPromptProps {
  message: string;
  onSignIn: () => void;
}

export default function AuthPrompt({ message, onSignIn }: AuthPromptProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
      <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onSignIn}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Sign in to Continue
      </button>
    </div>
  );
}