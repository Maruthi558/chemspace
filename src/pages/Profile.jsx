import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState({ full_name: '', organization: '', interests: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        setProfile({
          full_name: data.user.full_name || '',
          organization: data.user.organization || '',
          interests: data.user.interests || '',
        });
      } catch (err) {
        setError(err.message || 'Could not load profile');
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await updateProfile(profile);
      setSuccess('Profile updated successfully');
      setProfile({
        full_name: data.user.full_name || '',
        organization: data.user.organization || '',
        interests: data.user.interests || '',
      });
    } catch (err) {
      setError(err.message || 'Could not update profile');
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Profile</p>
        <h2>Customize your scientific profile</h2>
        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Full name
            <input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </label>
          <label>
            Organization
            <input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} />
          </label>
          <label>
            Interests
            <textarea value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} />
          </label>
          <button className="button" type="submit">Save profile</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </section>
    </div>
  );
}
