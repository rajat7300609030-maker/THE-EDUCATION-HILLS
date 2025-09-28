import React, { useState, useRef } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, SchoolProfile } from '../../../types';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import FormField from '../../ui/FormField';
import { useNotification } from '../../../contexts/NavigationContext';
import { setSchoolAsset } from '../../../utils/db';
import SchoolLogo from '../../ui/SchoolLogo';

const LOGO_KEY = 'school_logo';

const SchoolProfilePage: React.FC = () => {
  const [schoolProfile, setSchoolProfile] = useSchoolProfile();
  const [editData, setEditData] = useState<SchoolProfile>(schoolProfile);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof SchoolProfile, value: string) => {
    setEditData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let hasLogo = schoolProfile.hasLogo;
      if (logoFile) {
        await setSchoolAsset(LOGO_KEY, logoFile);
        hasLogo = true;
      }
      
      setSchoolProfile({ ...editData, hasLogo });
      addNotification('School profile updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update school profile.', 'danger');
      console.error(error);
    }
  };

  return (
    <PageWrapper page={Page.SchoolProfile}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Profile Details */}
          <div className="lg:col-span-2 neo-container rounded-xl p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="School Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1-4a1 1 0 01-1-1v-2a1 1 0 011-1h1m-1 4a1 1 0 001-1v-2a1 1 0 00-1-1h-1m3 4h1m-1-4h1" /></svg>}>
                    <input type="text" name="name" value={editData.name} onChange={handleInputChange} className="neo-button w-full rounded-xl p-3" />
                </FormField>
                <FormField label="School Motto" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}>
                    <input type="text" name="motto" value={editData.motto} onChange={handleInputChange} className="neo-button w-full rounded-xl p-3" />
                </FormField>
                 <FormField label="Academic Session" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 15.75h.008v.008H12v-.008z" /></svg>}>
                    <input type="text" name="session" value={editData.session} onChange={handleInputChange} placeholder="e.g., 2025-2026" className="neo-button w-full rounded-xl p-3" />
                </FormField>
                <FormField label="School ID / Affiliation No." icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>}>
                    <input type="text" name="schoolId" value={editData.schoolId || ''} onChange={handleInputChange} placeholder="e.g., CBSE/AFF/12345" className="neo-button w-full rounded-xl p-3" />
                </FormField>
                <FormField label="School Contact Number" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
                    <input type="tel" name="schoolNumber" value={editData.schoolNumber || ''} onChange={handleInputChange} placeholder="e.g., 011-12345678" className="neo-button w-full rounded-xl p-3" />
                </FormField>
                 <div className="md:col-span-2">
                    <FormField label="School Address" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
                        <textarea name="schoolAddress" value={editData.schoolAddress || ''} onChange={handleInputChange} rows={3} className="neo-button w-full rounded-xl p-3" placeholder="Enter full school address..."></textarea>
                    </FormField>
                 </div>
            </div>
          </div>

          {/* Column 2: Branding */}
          <div className="lg:col-span-1 space-y-6">
            <div className="neo-container rounded-xl p-6">
                <h3 className="text-xl font-bold border-b border-gray-300 pb-3 mb-4">Branding</h3>
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-center mb-2">School Logo</h4>
                    <div className="w-36 h-36 flex items-center justify-center">
                        <div 
                            className="relative group transition-transform duration-200"
                            style={{ transform: `scale(${(editData.logoSize || 100) / 100})` }}
                        >
                            <SchoolLogo hasLogo={editData.hasLogo} alt="Logo" className="neo-container rounded-full w-24 h-24 object-cover"/>
                            {logoPreview && <img src={logoPreview} alt="New logo preview" className="absolute inset-0 rounded-full w-24 h-24 object-cover border-2 border-blue-400"/>}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />

                    <div className="w-full mt-4">
                        <label htmlFor="logo-size-slider" className="text-sm font-medium flex justify-between">
                            <span>Logo Size</span> 
                            <span className="font-bold text-blue-600">{editData.logoSize || 100}%</span>
                        </label>
                        <input
                            id="logo-size-slider"
                            type="range"
                            min="50"
                            max="150"
                            step="5"
                            value={editData.logoSize || 100}
                            onChange={e => handleSliderChange('logoSize', e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer neo-button mt-2"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 border-t border-gray-300 pt-4">
            <button type="submit" className="neo-button-success rounded-xl px-6 py-2 text-base font-semibold">
                Save Profile
            </button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default SchoolProfilePage;
