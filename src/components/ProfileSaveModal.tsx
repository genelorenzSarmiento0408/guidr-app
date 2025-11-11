"use client";

import { X, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSaveModal({
  isOpen,
  onClose,
}: ProfileSaveModalProps) {
  const router = useRouter();

  function handleViewProfile() {
    onClose();
    router.push("/profile");
  }

  function handleEditProfile() {
    onClose();
    // Stay on same page, just close modal
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4">
      <div className="max-w-md w-full mx-auto mt-20 bg-white rounded-lg shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-green-600"
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
          <h2 className="text-2xl font-bold text-gray-900">Profile Saved!</h2>
          <p className="mt-2 text-gray-600">
            Your profile has been successfully updated.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleViewProfile}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </button>
          <button
            onClick={handleEditProfile}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Again
          </button>
        </div>
      </div>
    </div>
  );
}
