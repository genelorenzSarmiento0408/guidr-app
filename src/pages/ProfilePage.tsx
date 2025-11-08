import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Profile } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Loader2, DollarSign } from 'lucide-react';
import ProfileSaveModal from '../components/ProfileSaveModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTypes, setUserTypes] = useState<('student' | 'company')[]>([]);
  const isEditing = new URLSearchParams(location.search).get('edit') === 'true';

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  async function checkUserAndProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setProfile({
            id: data.id,
            username: data.username,
            program: data.program,
            yearStanding: data.year_standing,
            chatLink: data.chat_link,
            photoUrl: data.photo_url,
            skills: data.skills,
            userId: data.user_id,
            createdAt: data.created_at,
            mentorshipLink: data.mentorship_link,
            mentorshipPrice: data.mentorship_price,
            userType: data.user_type || []
          });
          setUserTypes(data.user_type || []);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    try {
      setUploadingPhoto(true);
      setPhotoError('');

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          userId: user.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await response.json();
      setProfile(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

      if (!profile.username) throw new Error('Username is required');
      if (userTypes.includes('student') && !profile.program) throw new Error('Program is required for students');
      if (!profile.yearStanding) throw new Error('Year standing is required');
      if (!profile.skills) throw new Error('Skills are required');
      if (userTypes.length === 0) throw new Error('Please select at least one user type');

      const updates = {
        user_id: user.id,
        username: profile.username,
        program: profile.program,
        year_standing: profile.yearStanding,
        chat_link: profile.chatLink || null,
        photo_url: profile.photoUrl || null,
        skills: profile.skills,
        mentorship_link: profile.mentorshipLink || null,
        mentorship_price: profile.mentorshipPrice || null,
        user_type: userTypes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      setShowSaveModal(true);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function handleUserTypeChange(type: 'student' | 'company') {
    setUserTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                {uploadingPhoto ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {profile.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0">
                <label
                  htmlFor="photoUrl"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Camera size={16} />
                </label>
                <input
                  type="file"
                  id="photoUrl"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoUpload(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {photoError && (
            <div className="text-red-600 text-sm text-center">{photoError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a: (select all that apply)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userTypes.includes('student')}
                  onChange={() => handleUserTypeChange('student')}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                />
                <span className="ml-2">Student</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userTypes.includes('company')}
                  onChange={() => handleUserTypeChange('company')}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-4 w-4"
                />
                <span className="ml-2">Company</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              maxLength={20}
              required
              value={profile.username || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Choose a username"
            />
          </div>

          {userTypes.includes('student') && (
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                Program
              </label>
              <input
                type="text"
                id="program"
                required
                value={profile.program || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, program: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="e.g., BS Computer Science"
              />
            </div>
          )}

          <div>
            <label htmlFor="yearStanding" className="block text-sm font-medium text-gray-700">
              Year Standing
            </label>
            <select
              id="yearStanding"
              required
              value={profile.yearStanding || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, yearStanding: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          <div>
            <label htmlFor="chatLink" className="block text-sm font-medium text-gray-700">
              Chat Link
            </label>
            <input
              type="url"
              id="chatLink"
              value={profile.chatLink || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, chatLink: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="https://..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Add a link to your preferred chat platform (Discord, LinkedIn, etc.)
            </p>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              MIC Details
            </h3>
            
            <div>
              <label htmlFor="mentorshipLink" className="block text-sm font-medium text-gray-700">
                Inquiry Link
              </label>
              <input
                type="url"
                id="mentorshipLink"
                value={profile.mentorshipLink || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, mentorshipLink: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="https://calendly.com/your-link"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add your Calendly or booking system link where students can schedule sessions
              </p>
            </div>

            <div>
              <label htmlFor="mentorshipPrice" className="block text-sm font-medium text-gray-700">
                Price (PHP)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₱</span>
                </div>
                <input
                  type="number"
                  id="mentorshipPrice"
                  min="0"
                  step="0.01"
                  value={profile.mentorshipPrice || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, mentorshipPrice: parseFloat(e.target.value) }))}
                  className="block w-full pl-7 rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Skills & Interests
            </label>
            <textarea
              id="skills"
              required
              value={profile.skills || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Tell us about your skills, interests, and what you're passionate about!"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>

        <ProfileSaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        />
      </div>
    </div>
  );
}