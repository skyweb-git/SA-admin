import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ExternalLink,
  Edit3,
  Phone,
  Building2,
  MapPin,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  Wifi,
  Car,
  Clock,
  Flame,
  UtensilsCrossed,
  ShieldCheck,
  Star,
  Plane,
  Lock,
  Bath,
  Coffee,
  RotateCcw,
  Navigation,
  Mail,
  Check,
  X,
  Palette,
  BedDouble
} from 'lucide-react';
import { 
  fetchContentFromAPI, 
  saveContentToAPI, 
  fetchAllMedia, 
  uploadMediaToAPI, 
  deleteMediaFromAPI,
  resetContentToDefault,
  DEFAULT_CONTENT 
} from '../../services/cmsService';
import { getWebsiteUrl } from '../../services/apiConfig';

const THEME_PRESETS = [
  {
    id: 'oceanic',
    name: 'Edion Royal Classic (Royal Blue & Navy)',
    badge: 'Live Site Default',
    previewColors: ['#2563eb', '#102138', '#ffffff'],
    description: 'The authentic live site colors: Royal Blue accent (#2563eb), Deep Navy (#102138), and clean White surfaces.',
    theme: {
      presetName: 'Edion Royal Classic (Royal Blue & Navy)',
      accentColor: '#2563eb',
      accentGlow: '#60a5fa',
      accentSubtle: '#dbeafe',
      darkPrimary: '#0f172a',
      darkNavy: '#102138',
      darkNavyLight: '#1e293b',
      pageBg: '#f8fafc',
      surfaceBg: '#ffffff',
      surfaceSubtle: '#f1f5f9',
      textColor: '#102138',
      textMuted: '#556c86',
      borderColor: '#e2e8f0'
    }
  },
  {
    id: 'emerald',
    name: 'Atlantic Coast (Emerald & Seafoam)',
    badge: 'Coastal Relaxed',
    previewColors: ['#059669', '#0d281e', '#ffffff'],
    description: 'Fresh sea-spray emerald accents with dark spruce headers and crisp white backgrounds.',
    theme: {
      presetName: 'Atlantic Coast (Emerald & Seafoam)',
      accentColor: '#059669',
      accentGlow: '#34d399',
      accentSubtle: '#d1fae5',
      darkPrimary: '#061a14',
      darkNavy: '#0d281e',
      darkNavyLight: '#14382a',
      pageBg: '#f6faf8',
      surfaceBg: '#ffffff',
      surfaceSubtle: '#eef7f2',
      textColor: '#0d281e',
      textMuted: '#4b6357',
      borderColor: '#d8e5df'
    }
  },
  {
    id: 'obsidian_gold',
    name: 'Royal Boutique (Gold & Charcoal)',
    badge: 'Luxury Boutique',
    previewColors: ['#d97706', '#181b20', '#ffffff'],
    description: 'Warm boutique gold accents against dark charcoal tones.',
    theme: {
      presetName: 'Royal Boutique (Gold & Charcoal)',
      accentColor: '#d97706',
      accentGlow: '#fbbf24',
      accentSubtle: '#fef3c7',
      darkPrimary: '#0d0f12',
      darkNavy: '#181b20',
      darkNavyLight: '#262a32',
      pageBg: '#fbfaf8',
      surfaceBg: '#ffffff',
      surfaceSubtle: '#f6f3ed',
      textColor: '#181b20',
      textMuted: '#6b6a65',
      borderColor: '#e5e2db'
    }
  }
];

const AVAILABLE_ICONS = [
  'Wifi', 'Car', 'Plane', 'Clock', 'UtensilsCrossed', 'Flame', 'Sparkles', 'Lock',
  'Coffee', 'BedDouble', 'Bath', 'ShieldCheck', 'Star', 'MapPin', 'Phone', 'Mail'
];

export default function WebsiteCmsView() {
  // Tabs: 'hero' | 'stats' | 'about' | 'rooms' | 'inclusions' | 'amenities' | 'location' | 'reviews' | 'contact' | 'theme' | 'media'
  const [activeSubTab, setActiveSubTab] = useState('hero');
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Editing state for rooms
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    id: '',
    title: '',
    badge: '',
    stats: '',
    pricePerNight: 850,
    maxGuests: 2,
    features: ['Private bathroom', 'Work desk', 'Flat-screen TV'],
    imageUrl: ''
  });

  // Editing state for amenities
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);
  const [selectedAmenityIndex, setSelectedAmenityIndex] = useState(null);
  const [amenityFormData, setAmenityFormData] = useState({
    id: '',
    name: '',
    category: 'Comfort',
    desc: '',
    icon: 'Wifi'
  });

  // Editing state for reviews
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    id: Date.now(),
    name: '',
    location: '',
    rating: 5.0,
    initials: '',
    quote: ''
  });

  // File upload ref
  const fileInputRef = useRef(null);
  const [uploadTargetField, setUploadTargetField] = useState(null);

  useEffect(() => {
    loadCMSData();
  }, []);

  const loadCMSData = async () => {
    setIsLoading(true);
    try {
      const [fetchedContent, fetchedMedia] = await Promise.all([
        fetchContentFromAPI(),
        fetchAllMedia()
      ]);
      if (fetchedContent) {
        setContent(fetchedContent);
      }
      if (fetchedMedia && fetchedMedia.data) {
        setMediaList(fetchedMedia.data);
      }
    } catch (err) {
      console.warn('CMS load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedData = content) => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await saveContentToAPI(updatedData);
      if (res && res.success !== false) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg(res?.message || 'Failed to save changes to backend API.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Save error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all website text to factory defaults? Any unsaved edits will be overwritten.')) {
      return;
    }
    setIsSaving(true);
    try {
      await resetContentToDefault();
      setContent(DEFAULT_CONTENT);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Reset failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic content updater
  const updateSection = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Image Upload handler
  const triggerFileUpload = (targetField) => {
    setUploadTargetField(targetField);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await uploadMediaToAPI(formData);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        // Apply uploaded URL to target
        if (uploadTargetField === 'hero.custom') {
          setContent(prev => ({
            ...prev,
            hero: {
              ...prev.hero,
              bgImages: { ...prev.hero.bgImages, custom: uploadedUrl }
            }
          }));
        } else if (uploadTargetField === 'hero.estate') {
          setContent(prev => ({
            ...prev,
            hero: {
              ...prev.hero,
              bgImages: { ...prev.hero.bgImages, estate: uploadedUrl }
            }
          }));
        } else if (uploadTargetField === 'hero.surreal') {
          setContent(prev => ({
            ...prev,
            hero: {
              ...prev.hero,
              bgImages: { ...prev.hero.bgImages, surreal: uploadedUrl }
            }
          }));
        } else if (uploadTargetField === 'roomForm') {
          setRoomFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
        }

        // Refresh media list
        const m = await fetchAllMedia();
        if (m && m.data) setMediaList(m.data);
      } else {
        alert(res?.message || 'Upload failed or backend did not return URL.');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Room Management Actions
  const handleSaveRoom = () => {
    if (!roomFormData.title) {
      alert('Room title is required');
      return;
    }
    const currentRooms = [...(content.roomsSection?.items || [])];
    if (isAddingRoom) {
      const newRoom = {
        ...roomFormData,
        id: roomFormData.id || ('room-' + Date.now())
      };
      currentRooms.push(newRoom);
    } else if (selectedRoomIndex !== null) {
      currentRooms[selectedRoomIndex] = { ...roomFormData };
    }

    const updated = {
      ...content,
      roomsSection: {
        ...content.roomsSection,
        items: currentRooms
      }
    };
    setContent(updated);
    handleSave(updated);
    setIsAddingRoom(false);
    setSelectedRoomIndex(null);
  };

  const handleDeleteRoom = (index) => {
    if (!window.confirm('Delete this room from website?')) return;
    const currentRooms = content.roomsSection?.items?.filter((_, i) => i !== index) || [];
    const updated = {
      ...content,
      roomsSection: {
        ...content.roomsSection,
        items: currentRooms
      }
    };
    setContent(updated);
    handleSave(updated);
  };

  // Amenity Management Actions
  const handleSaveAmenity = () => {
    if (!amenityFormData.name) {
      alert('Amenity name is required');
      return;
    }
    const current = [...(content.amenitiesSection?.items || [])];
    if (isAddingAmenity) {
      current.push({ ...amenityFormData, id: 'amenity-' + Date.now() });
    } else if (selectedAmenityIndex !== null) {
      current[selectedAmenityIndex] = { ...amenityFormData };
    }
    const updated = {
      ...content,
      amenitiesSection: {
        ...content.amenitiesSection,
        items: current
      }
    };
    setContent(updated);
    handleSave(updated);
    setIsAddingAmenity(false);
    setSelectedAmenityIndex(null);
  };

  const handleDeleteAmenity = (index) => {
    if (!window.confirm('Delete this amenity?')) return;
    const current = content.amenitiesSection?.items?.filter((_, i) => i !== index) || [];
    const updated = {
      ...content,
      amenitiesSection: {
        ...content.amenitiesSection,
        items: current
      }
    };
    setContent(updated);
    handleSave(updated);
  };

  // Review Management Actions
  const handleSaveReview = () => {
    if (!reviewFormData.name || !reviewFormData.quote) {
      alert('Guest name and review quote are required');
      return;
    }
    const initials = reviewFormData.initials || 
      reviewFormData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const current = [...(content.reviewsSection?.items || [])];
    if (isAddingReview) {
      current.push({ ...reviewFormData, initials, id: Date.now() });
    } else if (selectedReviewIndex !== null) {
      current[selectedReviewIndex] = { ...reviewFormData, initials };
    }
    const updated = {
      ...content,
      reviewsSection: {
        ...content.reviewsSection,
        items: current
      }
    };
    setContent(updated);
    handleSave(updated);
    setIsAddingReview(false);
    setSelectedReviewIndex(null);
  };

  const handleDeleteReview = (index) => {
    if (!window.confirm('Delete this review?')) return;
    const current = content.reviewsSection?.items?.filter((_, i) => i !== index) || [];
    const updated = {
      ...content,
      reviewsSection: {
        ...content.reviewsSection,
        items: current
      }
    };
    setContent(updated);
    handleSave(updated);
  };

  const liveWebsiteUrl = getWebsiteUrl();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', flexDirection: 'column', gap: '12px' }}>
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>Loading Edion Royal Website Content...</span>
      </div>
    );
  }

  return (
    <div className="cms-container" style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Hidden File Input for Cloudinary / Backend Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {/* Top Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#eff6ff',
              color: '#2563eb',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              LIVE CMS &amp; TEXT CONTROL
            </span>
            <span style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Connected to MongoDB
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
            Edion Royal Website Content Manager
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Modify any text, headline, rooms, amenities, contact numbers, or photos. Every change syncs in real-time to the live website.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => handleSave()}
            disabled={isSaving || isUploading}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notifications Banner */}
      {saveSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle size={20} color="#10b981" />
          <span>Website content updated successfully! The live website and local cache are synchronized.</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          color: '#991b1b',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={20} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        background: '#ffffff',
        padding: '8px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem'
      }}>
        {[
          { id: 'hero', label: '1. Hero & Banner', icon: Building2 },
          { id: 'stats', label: '2. Ratings & Stats', icon: Star },
          { id: 'about', label: '3. About & Welcome', icon: Sparkles },
          { id: 'rooms', label: '4. Rooms Manager', icon: BedDouble },
          { id: 'inclusions', label: '5. Inclusions', icon: Bath },
          { id: 'amenities', label: '6. Amenities Directory', icon: Coffee },
          { id: 'location', label: '7. Location & Distances', icon: MapPin },
          { id: 'reviews', label: '8. Guest Reviews', icon: Star },
          { id: 'contact', label: '9. Contact & Times', icon: Phone },
          { id: 'theme', label: '10. Theme & Colors', icon: Palette },
          { id: 'media', label: '11. Media Gallery', icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#2563eb' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isActive ? '#2563eb' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HERO & TOP BANNER                                  */}
      {/* ========================================================= */}
      {activeSubTab === 'hero' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Hero Section &amp; Background Views
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Control the top hero screen of Edion Royal Guesthouse: main headline, subtitle, direct contact numbers, and 3 swappable background views.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Location / Eyebrow Badge
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.eyebrowBadge || ''} 
                onChange={(e) => updateSection('hero', 'eyebrowBadge', e.target.value)}
                placeholder="Milnerton · Cape Town"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Direct Reservations Phone
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.phone || ''} 
                onChange={(e) => updateSection('hero', 'phone', e.target.value)}
                placeholder="078 972 4254"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Main Headline (Hero Title)
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.title || ''} 
                onChange={(e) => updateSection('hero', 'title', e.target.value)}
                placeholder="A warm, quiet stay minutes from the sea"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Hero Subheading / Tagline
              </label>
              <textarea 
                rows={3}
                className="form-input" 
                value={content.hero?.subheading || ''} 
                onChange={(e) => updateSection('hero', 'subheading', e.target.value)}
                placeholder="Comfortable, secure accommodation in Milnerton. Private rooms, Wi-Fi and everything you need for a relaxed stay."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Primary CTA Button Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.ctaPrimary || ''} 
                onChange={(e) => updateSection('hero', 'ctaPrimary', e.target.value)}
                placeholder="Check availability"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Secondary CTA Button Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.ctaSecondary || ''} 
                onChange={(e) => updateSection('hero', 'ctaSecondary', e.target.value)}
                placeholder="View our rooms"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Hero Corner Address Title
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.addressTitle || ''} 
                onChange={(e) => updateSection('hero', 'addressTitle', e.target.value)}
                placeholder="7 Arum Street"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Hero Corner Address Subtitle
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.hero?.addressSubtitle || ''} 
                onChange={(e) => updateSection('hero', 'addressSubtitle', e.target.value)}
                placeholder="Milnerton, Cape Town"
              />
            </div>
          </div>

          {/* Background Views Switcher Images */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Hero 3D / Background View Images
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Guests can toggle between View 1, View 2, and View 3 on the hero card. You can provide direct image URLs or upload new images.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* View 1 */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>View 1 (Custom Guesthouse)</span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ marginTop: '6px', marginBottom: '8px', fontSize: '13px' }}
                  value={content.hero?.bgImages?.custom || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    hero: { ...prev.hero, bgImages: { ...prev.hero.bgImages, custom: e.target.value } }
                  }))}
                  placeholder="/798129955.jpg"
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => triggerFileUpload('hero.custom')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                >
                  <Upload size={13} /> Upload Image
                </button>
              </div>

              {/* View 2 */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>View 2 (Estate Exterior)</span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ marginTop: '6px', marginBottom: '8px', fontSize: '13px' }}
                  value={content.hero?.bgImages?.estate || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    hero: { ...prev.hero, bgImages: { ...prev.hero.bgImages, estate: e.target.value } }
                  }))}
                  placeholder="/513927625.jpg"
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => triggerFileUpload('hero.estate')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                >
                  <Upload size={13} /> Upload Image
                </button>
              </div>

              {/* View 3 */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>View 3 (Ambient 3D View)</span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ marginTop: '6px', marginBottom: '8px', fontSize: '13px' }}
                  value={content.hero?.bgImages?.surreal || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    hero: { ...prev.hero, bgImages: { ...prev.hero.bgImages, surreal: e.target.value } }
                  }))}
                  placeholder="/798153808.jpg"
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={() => triggerFileUpload('hero.surreal')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                >
                  <Upload size={13} /> Upload Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RATINGS & STATS                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'stats' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Guest Ratings &amp; Stats Banner
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              These ratings appear in the prominent 4-pillar banner below the hero card on the homepage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Pillar 1: Score &amp; Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.locationScore || ''} 
                onChange={(e) => updateSection('stats', 'locationScore', e.target.value)}
                placeholder="8.8"
                style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}
              />
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.locationLabel || ''} 
                onChange={(e) => updateSection('stats', 'locationLabel', e.target.value)}
                placeholder="Location"
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Pillar 2: Score &amp; Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.wifiScore || ''} 
                onChange={(e) => updateSection('stats', 'wifiScore', e.target.value)}
                placeholder="8.8"
                style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}
              />
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.wifiLabel || ''} 
                onChange={(e) => updateSection('stats', 'wifiLabel', e.target.value)}
                placeholder="Free WiFi"
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Pillar 3: Score &amp; Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.cleanlinessScore || ''} 
                onChange={(e) => updateSection('stats', 'cleanlinessScore', e.target.value)}
                placeholder="7.7"
                style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}
              />
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.cleanlinessLabel || ''} 
                onChange={(e) => updateSection('stats', 'cleanlinessLabel', e.target.value)}
                placeholder="Cleanliness"
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Pillar 4: Score &amp; Label
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.valueScore || ''} 
                onChange={(e) => updateSection('stats', 'valueScore', e.target.value)}
                placeholder="7.6"
                style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}
              />
              <input 
                type="text" 
                className="form-input" 
                value={content.stats?.valueLabel || ''} 
                onChange={(e) => updateSection('stats', 'valueLabel', e.target.value)}
                placeholder="Value for Money"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ABOUT & WELCOME                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'about' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Welcome &amp; About Guesthouse Section
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              The introductory card explaining Edion Royal Guesthouse, its family-run hospitality, and top highlights.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Welcome Badge
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.about?.badge || ''} 
                onChange={(e) => updateSection('about', 'badge', e.target.value)}
                placeholder="Welcome"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Main Welcome Title
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={content.about?.title || ''} 
                onChange={(e) => updateSection('about', 'title', e.target.value)}
                placeholder="Comfortable, secure accommodation in the heart of Milnerton"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                First Paragraph
              </label>
              <textarea 
                rows={3}
                className="form-input" 
                value={content.about?.description1 || ''} 
                onChange={(e) => updateSection('about', 'description1', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Second Paragraph
              </label>
              <textarea 
                rows={3}
                className="form-input" 
                value={content.about?.description2 || ''} 
                onChange={(e) => updateSection('about', 'description2', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ROOMS MANAGER (FULL CRUD)                          */}
      {/* ========================================================= */}
      {activeSubTab === 'rooms' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                Rooms Management ({content.roomsSection?.items?.length || 0} Rooms)
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Manage all guesthouse rooms: titles, capacity badges, descriptions, features, pricing, and photo gallery URLs.
              </p>
            </div>

            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setRoomFormData({
                  id: 'room-' + Date.now(),
                  title: '',
                  badge: '2 Guests',
                  stats: '',
                  pricePerNight: 850,
                  maxGuests: 2,
                  features: ['Private bathroom', 'Work desk', 'Flat-screen TV'],
                  imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop'
                });
                setIsAddingRoom(true);
                setSelectedRoomIndex(null);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Add New Room</span>
            </button>
          </div>

          {/* Section Header Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="form-group">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Section Eyebrow Tag</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.roomsSection?.tag || ''} 
                onChange={(e) => updateSection('roomsSection', 'tag', e.target.value)}
                placeholder="Our rooms"
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Section Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.roomsSection?.title || ''} 
                onChange={(e) => updateSection('roomsSection', 'title', e.target.value)}
                placeholder="Renovated en-suite rooms for every kind of stay"
              />
            </div>
          </div>

          {/* Room Edit/Add Modal/Drawer */}
          {(isAddingRoom || selectedRoomIndex !== null) && (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {isAddingRoom ? '✨ Add New Room to Guesthouse' : `✏️ Edit Room: ${roomFormData.title}`}
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setIsAddingRoom(false); setSelectedRoomIndex(null); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Room Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={roomFormData.title} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, title: e.target.value })}
                    placeholder="e.g. Renovated Double Room"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Capacity Badge</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={roomFormData.badge} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, badge: e.target.value })}
                    placeholder="e.g. 2 Guests · Kitchenette"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Price Per Night (ZAR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={roomFormData.pricePerNight || 0} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: Number(e.target.value) })}
                    placeholder="850"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Max Guests</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={roomFormData.maxGuests || 2} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, maxGuests: Number(e.target.value) })}
                    placeholder="2"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Description / Stats Text</label>
                  <textarea 
                    rows={2}
                    className="form-input" 
                    value={roomFormData.stats} 
                    onChange={(e) => setRoomFormData({ ...roomFormData, stats: e.target.value })}
                    placeholder="A calm, recently renovated room with a private en-suite bathroom..."
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Features (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={Array.isArray(roomFormData.features) ? roomFormData.features.join(', ') : ''} 
                    onChange={(e) => setRoomFormData({
                      ...roomFormData,
                      features: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Private bathroom, Flat-screen TV, Free WiFi, Work desk"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Room Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={roomFormData.imageUrl} 
                      onChange={(e) => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => triggerFileUpload('roomForm')}
                      style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> Upload Image
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setIsAddingRoom(false); setSelectedRoomIndex(null); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveRoom}
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  Save Room
                </button>
              </div>
            </div>
          )}

          {/* Rooms Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {content.roomsSection?.items?.map((room, idx) => (
              <div 
                key={room.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ height: '180px', position: 'relative', background: '#f1f5f9' }}>
                  <img 
                    src={room.imageUrl || '/798129955.jpg'} 
                    alt={room.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/798129955.jpg'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {room.badge || 'Room'}
                  </span>
                  {room.pricePerNight ? (
                    <span style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      R{room.pricePerNight}/night
                    </span>
                  ) : null}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    {room.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 10px', flex: 1 }}>
                    {room.stats}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                    {room.features?.map((f, fi) => (
                      <span key={fi} style={{ background: '#f1f5f9', color: '#475569', fontSize: '11.5px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setRoomFormData({
                          ...room,
                          pricePerNight: room.pricePerNight || 850,
                          maxGuests: room.maxGuests || 2,
                          features: room.features || []
                        });
                        setSelectedRoomIndex(idx);
                        setIsAddingRoom(false);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => handleDeleteRoom(idx)}
                      style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INCLUSIONS & GUARANTEES                            */}
      {/* ========================================================= */}
      {activeSubTab === 'inclusions' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Standard Room Inclusions
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              The standard inclusions guaranteed across every single room at Edion Royal Guesthouse.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Badge</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.inclusions?.badge || ''} 
                onChange={(e) => updateSection('inclusions', 'badge', e.target.value)}
                placeholder="Standard Inclusions"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Headline</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.inclusions?.title || ''} 
                onChange={(e) => updateSection('inclusions', 'title', e.target.value)}
                placeholder="Included in every room at Edion Royal"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Description</label>
              <textarea 
                rows={2}
                className="form-input" 
                value={content.inclusions?.description || ''} 
                onChange={(e) => updateSection('inclusions', 'description', e.target.value)}
              />
            </div>
          </div>

          {/* 3 Inclusions Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {content.inclusions?.items?.map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>Inclusion {idx + 1}</span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ marginTop: '6px', marginBottom: '8px', fontWeight: 700 }}
                  value={item.title} 
                  onChange={(e) => {
                    const items = [...(content.inclusions?.items || [])];
                    items[idx].title = e.target.value;
                    setContent(prev => ({ ...prev, inclusions: { ...prev.inclusions, items } }));
                  }}
                  placeholder="e.g. Private Bathroom"
                />
                <textarea 
                  rows={2}
                  className="form-input" 
                  value={item.desc} 
                  onChange={(e) => {
                    const items = [...(content.inclusions?.items || [])];
                    items[idx].desc = e.target.value;
                    setContent(prev => ({ ...prev, inclusions: { ...prev.inclusions, items } }));
                  }}
                  placeholder="Spotless private en-suite bathroom..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: AMENITIES DIRECTORY (FULL CRUD)                    */}
      {/* ========================================================= */}
      {activeSubTab === 'amenities' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                Amenities Directory ({content.amenitiesSection?.items?.length || 0} Amenities)
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Manage all guesthouse amenities shown on the Amenities page and Homepage.
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setAmenityFormData({
                  id: 'amenity-' + Date.now(),
                  name: '',
                  category: 'Comfort',
                  desc: '',
                  icon: 'Wifi'
                });
                setIsAddingAmenity(true);
                setSelectedAmenityIndex(null);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Add New Amenity</span>
            </button>
          </div>

          {/* Amenity Edit/Add Box */}
          {(isAddingAmenity || selectedAmenityIndex !== null) && (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {isAddingAmenity ? '✨ Add Amenity' : `✏️ Edit Amenity: ${amenityFormData.name}`}
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setIsAddingAmenity(false); setSelectedAmenityIndex(null); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Amenity Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={amenityFormData.name} 
                    onChange={(e) => setAmenityFormData({ ...amenityFormData, name: e.target.value })}
                    placeholder="e.g. Free high-speed WiFi"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Category</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={amenityFormData.category} 
                    onChange={(e) => setAmenityFormData({ ...amenityFormData, category: e.target.value })}
                    placeholder="e.g. Connectivity"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Icon</label>
                  <select 
                    className="form-input"
                    value={amenityFormData.icon}
                    onChange={(e) => setAmenityFormData({ ...amenityFormData, icon: e.target.value })}
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={amenityFormData.desc} 
                    onChange={(e) => setAmenityFormData({ ...amenityFormData, desc: e.target.value })}
                    placeholder="Reliable connection for work and streaming."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setIsAddingAmenity(false); setSelectedAmenityIndex(null); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveAmenity}
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  Save Amenity
                </button>
              </div>
            </div>
          )}

          {/* Amenities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {content.amenitiesSection?.items?.map((amenity, idx) => (
              <div 
                key={amenity.id || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {amenity.icon || 'Wifi'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{amenity.category}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    {amenity.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    {amenity.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAmenityFormData({ ...amenity });
                      setSelectedAmenityIndex(idx);
                      setIsAddingAmenity(false);
                    }}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#334155' }}
                    title="Edit amenity"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAmenity(idx)}
                    style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444' }}
                    title="Delete amenity"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: LOCATION & NEARBY DISTANCES                        */}
      {/* ========================================================= */}
      {activeSubTab === 'location' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Location, Address &amp; Key Landmarks
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Edit guesthouse address, travel times to Milnerton Beach, CTICC, Airport, and the Google Maps embed URL.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Section Headline</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.locationSection?.title || ''} 
                onChange={(e) => updateSection('locationSection', 'title', e.target.value)}
                placeholder="Table Mountain views, minutes from your door"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Guesthouse Physical Address</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.locationSection?.address || ''} 
                onChange={(e) => updateSection('locationSection', 'address', e.target.value)}
                placeholder="7 Arum Street, Milnerton, Cape Town, 7441"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Directions / Address Paragraph 1</label>
              <textarea 
                rows={2}
                className="form-input" 
                value={content.locationSection?.addressDetails1 || ''} 
                onChange={(e) => updateSection('locationSection', 'addressDetails1', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Directions / Address Paragraph 2</label>
              <textarea 
                rows={2}
                className="form-input" 
                value={content.locationSection?.addressDetails2 || ''} 
                onChange={(e) => updateSection('locationSection', 'addressDetails2', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Google Maps Embed URL</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.locationSection?.mapEmbedUrl || ''} 
                onChange={(e) => updateSection('locationSection', 'mapEmbedUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* Key Destinations & Driving Times */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Key Destinations &amp; Drive Times ({content.locationSection?.distances?.length || 0})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {content.locationSection?.distances?.map((dist, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ marginBottom: '6px', fontWeight: 700 }}
                    value={dist.name} 
                    onChange={(e) => {
                      const distances = [...(content.locationSection?.distances || [])];
                      distances[idx].name = e.target.value;
                      setContent(prev => ({ ...prev, locationSection: { ...prev.locationSection, distances } }));
                    }}
                    placeholder="e.g. Milnerton Beach"
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={dist.distance} 
                    onChange={(e) => {
                      const distances = [...(content.locationSection?.distances || [])];
                      distances[idx].distance = e.target.value;
                      setContent(prev => ({ ...prev, locationSection: { ...prev.locationSection, distances } }));
                    }}
                    placeholder="e.g. 1.8 km (3 mins)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: GUEST REVIEWS (FULL CRUD)                          */}
      {/* ========================================================= */}
      {activeSubTab === 'reviews' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                Guest Reviews ({content.reviewsSection?.items?.length || 0} Testimonials)
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Manage genuine guest reviews displayed in the homepage testimonial carousel.
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setReviewFormData({
                  id: Date.now(),
                  name: '',
                  location: 'South Africa',
                  rating: 5.0,
                  initials: '',
                  quote: ''
                });
                setIsAddingReview(true);
                setSelectedReviewIndex(null);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Add Guest Review</span>
            </button>
          </div>

          {/* Add/Edit Review Drawer */}
          {(isAddingReview || selectedReviewIndex !== null) && (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  {isAddingReview ? '✨ Add Review' : `✏️ Edit Review by ${reviewFormData.name}`}
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setIsAddingReview(false); setSelectedReviewIndex(null); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Guest Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={reviewFormData.name} 
                    onChange={(e) => setReviewFormData({ ...reviewFormData, name: e.target.value })}
                    placeholder="e.g. Lerato S."
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Guest Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={reviewFormData.location} 
                    onChange={(e) => setReviewFormData({ ...reviewFormData, location: e.target.value })}
                    placeholder="e.g. Pretoria"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Rating (1 - 5)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input" 
                    value={reviewFormData.rating} 
                    onChange={(e) => setReviewFormData({ ...reviewFormData, rating: Number(e.target.value) })}
                    placeholder="5.0"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Review Quote *</label>
                  <textarea 
                    rows={3}
                    className="form-input" 
                    value={reviewFormData.quote} 
                    onChange={(e) => setReviewFormData({ ...reviewFormData, quote: e.target.value })}
                    placeholder="The kitchenette made our week-long stay so much easier..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => { setIsAddingReview(false); setSelectedReviewIndex(null); }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveReview}
                  style={{ background: '#2563eb', color: '#fff' }}
                >
                  Save Review
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {content.reviewsSection?.items?.map((rev, idx) => (
              <div 
                key={rev.id || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      {rev.rating || '5.0'}
                    </span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#334155', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                    “{rev.quote}”
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                      {rev.initials || rev.name?.substring(0, 2) || 'GR'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{rev.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{rev.location}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewFormData({ ...rev });
                        setSelectedReviewIndex(idx);
                        setIsAddingReview(false);
                      }}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#334155' }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(idx)}
                      style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: CONTACT, CHECK-IN & POLICIES                       */}
      {/* ========================================================= */}
      {activeSubTab === 'contact' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Contact Channels, Times &amp; Footer Info
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Edit the official telephone number, WhatsApp contact, direct email address, check-in/out hours, and copyright statement.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Primary Phone (Display)</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.contact?.phone || ''} 
                onChange={(e) => updateSection('contact', 'phone', e.target.value)}
                placeholder="+27 78 972 4254"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>WhatsApp Link Number (Digits only)</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.contact?.whatsappNumber || ''} 
                onChange={(e) => updateSection('contact', 'whatsappNumber', e.target.value)}
                placeholder="27789724254"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Direct Reservations Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={content.contact?.email || ''} 
                onChange={(e) => updateSection('contact', 'email', e.target.value)}
                placeholder="stay@edionroyal.co.za"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Check-In Time</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.contact?.checkInTime || ''} 
                onChange={(e) => updateSection('contact', 'checkInTime', e.target.value)}
                placeholder="From 14:00 (24h assisted)"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Check-Out Time</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.contact?.checkOutTime || ''} 
                onChange={(e) => updateSection('contact', 'checkOutTime', e.target.value)}
                placeholder="By 10:00"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Official Website URL</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.contact?.websiteUrl || ''} 
                onChange={(e) => updateSection('contact', 'websiteUrl', e.target.value)}
                placeholder="https://edionroyal.co.za"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Footer Copyright Text</label>
              <input 
                type="text" 
                className="form-input" 
                value={content.footer?.copyright || ''} 
                onChange={(e) => updateSection('footer', 'copyright', e.target.value)}
                placeholder="© 2026 Edion Royal Guesthouse, Milnerton, Cape Town."
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: THEME & COLORS                                    */}
      {/* ========================================================= */}
      {activeSubTab === 'theme' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Website Color Palette &amp; Presets
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Select a curated luxury hospitality theme or fine-tune individual accent, navbar, and background colors.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {THEME_PRESETS.map(preset => (
              <div 
                key={preset.id}
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    theme: { ...preset.theme }
                  }));
                }}
                style={{
                  background: '#f8fafc',
                  border: content.theme?.presetName === preset.name ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{preset.name}</span>
                  <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {preset.badge}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {preset.previewColors.map((col, ci) => (
                    <div key={ci} style={{ width: '28px', height: '28px', borderRadius: '50%', background: col, border: '1px solid rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{preset.description}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Custom Accent Color Tuning
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="color" 
                  value={content.theme?.accentColor || '#2563eb'}
                  onChange={(e) => updateSection('theme', 'accentColor', e.target.value)}
                  style={{ width: '42px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Primary Accent ({content.theme?.accentColor || '#2563eb'})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="color" 
                  value={content.theme?.darkNavy || '#102138'}
                  onChange={(e) => updateSection('theme', 'darkNavy', e.target.value)}
                  style={{ width: '42px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Dark Navy &amp; Headers ({content.theme?.darkNavy || '#102138'})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: MEDIA GALLERY                                     */}
      {/* ========================================================= */}
      {activeSubTab === 'media' && (
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                Media Gallery &amp; Cloud Uploads
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Upload photos to your backend server or Cloudinary, and copy links directly into rooms or hero backgrounds.
              </p>
            </div>

            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => triggerFileUpload('gallery')}
              disabled={isUploading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontWeight: 700 }}
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {mediaList.map((media, idx) => (
              <div 
                key={media.key || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '140px', background: '#000', position: 'relative' }}>
                  <img 
                    src={media.url} 
                    alt={media.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 700
                  }}>
                    {media.category || 'image'}
                  </span>
                </div>

                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {media.name}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(media.url);
                        alert('Image URL copied to clipboard: ' + media.url);
                      }}
                      style={{ fontSize: '11px', flex: 1, padding: '4px' }}
                    >
                      Copy URL
                    </button>
                    {media.key && !media.key.startsWith('room-') && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Remove this photo?')) {
                            await deleteMediaFromAPI(media.key);
                            setMediaList(prev => prev.filter(m => m.key !== media.key));
                          }
                        }}
                        style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
