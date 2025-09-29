import Modal from 'react-modal';
import { X, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import type { Profile } from '../types';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

Modal.setAppElement('#root');

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export default function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAuthAndSaveStatus();
    }
  }, [isOpen, profile.id]);

  async function checkAuthAndSaveStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        const { data } = await supabase
          .from('saved_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('saved_profile_id', profile.id)
          .maybeSingle();

        setSaved(!!data);
      }
    } catch (error) {
      console.error('Error checking saved profile:', error);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: 'google'
        });
        if (signInError) throw signInError;
        return;
      }

      if (saved) {
        const { error } = await supabase
          .from('saved_profiles')
          .delete()
          .eq('user_id', user.id)
          .eq('saved_profile_id', profile.id);

        if (error) throw error;
        setSaved(false);
      } else {
        const { error } = await supabase
          .from('saved_profiles')
          .insert({
            user_id: user.id,
            saved_profile_id: profile.id
          });

        if (error) throw error;
        setSaved(true);
        
        setTimeout(() => {
          onClose();
          navigate('/saved');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleMentorshipBooking() {
    if (profile.mentorshipLink) {
      window.open(profile.mentorshipLink, '_blank');
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-2xl mx-auto mt-32 bg-white rounded-lg shadow-xl p-6 relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50"
      style={{
        overlay: {
          zIndex: 1000
        }
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={24} />
      </button>

      <div className="flex items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-6 flex-grow">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className={`inline-flex items-center p-2 rounded-full transition-colors ${
                saved
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={saved ? 'Remove from saved profiles' : 'Save profile'}
            >
              {saved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
            </button>
          </div>
          <p className="text-gray-600">{profile.program} • {profile.yearStanding}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">About</h3>
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showDetails && (
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{profile.skills}</p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {saved && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm text-center">
            Profile saved! Redirecting to saved profiles...
          </div>
        )}

        <div className="flex flex-col space-y-3">
          {profile.mentorshipLink && (
            <button
              onClick={handleMentorshipBooking}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Book Mentorship Session
              {profile.mentorshipPrice && (
                <span className="ml-1 text-green-100">
                  (${profile.mentorshipPrice}/hour)
                </span>
              )}
            </button>
          )}
          
          {profile.chatLink && (
            <a
              href={profile.chatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Chat Now
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}