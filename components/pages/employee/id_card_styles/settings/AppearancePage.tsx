import React, { useState, useRef, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, SchoolProfile } from '../../../types';
import useTheme from '../../../hooks/useTheme';
import ToggleSwitch from '../../ui/ToggleSwitch';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import { useNotification } from '../../../contexts/NavigationContext';
import { setSchoolAsset } from '../../../utils/db';
import { BACKGROUND_EFFECTS } from '../../../constants/backgroundEffects';
import SchoolBackgroundImage from '../../ui/SchoolBackgroundImage';

const BACKGROUND_KEY = 'school_background_image';

const CARD_LAYOUT_STYLES = [
    { id: 'style1', name: 'Glass Panel', preview: <div className="w-24 h-16 neo-container rounded-md bg-cover bg-center bg-[url('https://placehold.co/100x64/3b82f6/FFF')] relative"><div className="absolute bottom-1 left-1 right-1 h-6 bg-white/30 backdrop-blur-sm rounded"></div></div> },
    { id: 'style2', name: 'Classic Split', preview: <div className="w-24 h-16 neo-container rounded-md flex"><div className="w-1/2 h-full bg-cover bg-center bg-[url('https://placehold.co/50x64/3b82f6/FFF')] rounded-l-md"></div><div className="w-1/2 h-full bg-white rounded-r-md"></div></div> },
    { id: 'style3', name: 'Minimal Overlay', preview: <div className="w-24 h-16 neo-container rounded-md bg-cover bg-center bg-[url('https://placehold.co/100x64/3b82f6/FFF')] relative"><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div></div> },
    { id: 'style4', name: 'Centered Focus', preview: <div className="w-24 h-16 neo-container rounded-md bg-cover bg-center bg-[url('https://placehold.co/100x64/3b82f6/FFF?text=)] relative flex items-center justify-center"><div className="w-16 h-10 bg-white neo-container rounded"></div></div> },
    { id: 'style5', name: 'Side Info Bar', preview: <div className="w-24 h-16 neo-container rounded-md flex"><div className="w-2/3 h-full bg-cover bg-center bg-[url('https://placehold.co/66x64/3b82f6/FFF')] rounded-l-md"></div><div className="w-1/3 h-full bg-gray-100 rounded-r-md"></div></div> },
];

const EffectPreview: React.FC<{ profileSettings: Partial<SchoolProfile>, previewUrl: string | null }> = ({ profileSettings, previewUrl }) => {
    const imageStyle: React.CSSProperties = {};
    const overlayStyle: React.CSSProperties = {};
    const filters = [];
    if (profileSettings.backgroundImageBlur && profileSettings.backgroundImageBlur > 0) {
        filters.push(`blur(${profileSettings.backgroundImageBlur * 0.16}px)`);
    }
    const intensity = profileSettings.backgroundImageEffectIntensity ?? 50;
    const effect = BACKGROUND_EFFECTS.find(e => e.id === profileSettings.backgroundImageEffect);
    if (effect && effect.usesIntensity) {
        switch (effect.id) {
            case 'grayscale': filters.push(`grayscale(${intensity}%)`); break;
            case 'sepia': filters.push(`sepia(${intensity}%)`); break;
            case 'darken': overlayStyle.backgroundColor = `rgba(0, 0, 0, ${intensity / 100})`; break;
            case 'lighten': overlayStyle.backgroundColor = `rgba(255, 255, 255, ${intensity / 100})`; break;
        }
    }
    if (filters.length > 0) {
        imageStyle.filter = filters.join(' ');
    }

    return (
        <div className="relative w-full h-32 rounded-lg overflow-hidden neo-container mt-4">
            {previewUrl ? 
              <img src={previewUrl} alt="Effect Preview" className="w-full h-full object-cover transition-all duration-200" style={imageStyle} />
              : <SchoolBackgroundImage hasBackgroundImage={profileSettings.hasBackgroundImage || false} alt="Effect Preview" className="w-full h-full object-cover transition-all duration-200" style={imageStyle} />}
            <div className="absolute inset-0 transition-all duration-200" style={overlayStyle}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-2 left-2 text-white p-1 rounded">
                <h4 className="font-bold text-sm [text-shadow:_1px_1px_2px_rgb(0_0_0_/_70%)]">School Name</h4>
                <p className="text-xs [text-shadow:_1px_1px_2px_rgb(0_0_0_/_70%)]">School Motto</p>
            </div>
        </div>
    );
};

const AppearancePage: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [schoolProfile, setSchoolProfile] = useSchoolProfile();
  const [editData, setEditData] = useState<SchoolProfile>(schoolProfile);
  const { addNotification } = useNotification();
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  };

  const handleSliderChange = (name: keyof SchoolProfile, value: string) => {
    setEditData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBackgroundImagePreview(previewUrl);
      setEditData(prev => ({ ...prev, hasBackgroundImage: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let hasBackgroundImage = schoolProfile.hasBackgroundImage;
      if (backgroundImageFile) {
        await setSchoolAsset(BACKGROUND_KEY, backgroundImageFile);
        hasBackgroundImage = true;
      }
      setSchoolProfile({ ...editData, hasBackgroundImage });
      addNotification('Appearance settings updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update appearance settings.', 'danger');
      console.error(error);
    }
  };
  
  const selectedEffect = useMemo(() => {
    return BACKGROUND_EFFECTS.find(e => e.id === editData.backgroundImageEffect)
  }, [editData.backgroundImageEffect]);

  return (
    <PageWrapper page={Page.Appearance}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 pb-3 mb-4">Theme</h3>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <label htmlFor="dark-mode-toggle" className="text-sm font-medium flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span>Enable Dark Mode</span>
              </label>
              <ToggleSwitch id="dark-mode-toggle" checked={theme === 'dark'} onChange={handleThemeChange} />
            </div>
          </div>
          
          <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 pb-3 mb-4">Dashboard Appearance</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-3">Profile Card Layout</h4>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {CARD_LAYOUT_STYLES.map(style => (
                            <button key={style.id} type="button" onClick={() => setEditData(prev => ({ ...prev, profileCardStyle: style.id }))} className={`neo-button rounded-lg p-2 text-center transition-all ${editData.profileCardStyle === style.id ? 'active' : ''}`}>
                                {style.preview}
                                <span className="text-xs font-semibold mt-2 block">{style.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="duration-slider" className="text-sm font-medium flex justify-between"><span>Image Slider Speed</span><span className="font-bold text-blue-600">{ (editData.sliderDuration || 5000) / 1000 } seconds</span></label>
                    <input id="duration-slider" type="range" min="2" max="10" step="1" value={(editData.sliderDuration || 5000) / 1000} onChange={e => setEditData(prev => ({ ...prev, sliderDuration: Number(e.target.value) * 1000 }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer neo-button mt-2" />
                </div>
            </div>
          </div>

          <div className="neo-container rounded-xl p-6">
            <h3 className="text-xl font-bold border-b border-gray-300 pb-3 mb-4">Dashboard Background</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between">
                <h4 className="font-semibold mb-2 sm:mb-0">Background Image</h4>
                <button type="button" onClick={() => backgroundFileInputRef.current?.click()} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4-4v12" /></svg>
                    <span>{editData.hasBackgroundImage ? 'Change Image' : 'Upload Image'}</span>
                </button>
                <input ref={backgroundFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageChange} />
            </div>

            <div className="border-t border-gray-300 pt-4 mt-4">
                <h4 className="font-semibold text-center mb-3">Image Effects</h4>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {BACKGROUND_EFFECTS.map(effect => (
                        <button key={effect.id} type="button" onClick={() => setEditData(p => ({...p, backgroundImageEffect: effect.id}))} className={`neo-button text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${editData.backgroundImageEffect === effect.id ? 'active' : ''}`}>{effect.name}</button>
                    ))}
                </div>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium flex justify-between"><span>Blur Intensity</span> <span>{editData.backgroundImageBlur || 0}%</span></label>
                        <input type="range" min="0" max="100" value={editData.backgroundImageBlur || 0} onChange={e => handleSliderChange('backgroundImageBlur', e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer neo-button"/>
                    </div>
                    <div className={`${!selectedEffect?.usesIntensity ? 'opacity-50' : ''}`}>
                        <label className="text-sm font-medium flex justify-between"><span>Effect Intensity</span> <span>{editData.backgroundImageEffectIntensity || 0}%</span></label>
                        <input type="range" min="0" max="100" value={editData.backgroundImageEffectIntensity || 0} onChange={e => handleSliderChange('backgroundImageEffectIntensity', e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer neo-button" disabled={!selectedEffect?.usesIntensity}/>
                    </div>
                </div>
                <EffectPreview profileSettings={editData} previewUrl={backgroundImagePreview} />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
              <button type="submit" className="neo-button-success rounded-xl px-6 py-2 text-base font-semibold">
                  Save Appearance Settings
              </button>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
};

export default AppearancePage;
