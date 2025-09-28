import React from 'react';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import SchoolLogo from '../ui/SchoolLogo';
import SchoolBackgroundImage from '../ui/SchoolBackgroundImage';
import { SchoolProfile } from '../../types';

const SchoolProfileCard: React.FC = () => {
    const [schoolProfile] = useSchoolProfile();
    const logoStyle = { transform: `scale(${(schoolProfile.logoSize || 100) / 100})` };
    const style = schoolProfile.profileCardStyle || 'style1';

    const imageStyle: React.CSSProperties = {};
    const overlayStyle: React.CSSProperties = {};
    const filters = [];
    if (schoolProfile.backgroundImageBlur && schoolProfile.backgroundImageBlur > 0) {
        filters.push(`blur(${schoolProfile.backgroundImageBlur * 0.16}px)`);
    }
    const intensity = schoolProfile.backgroundImageEffectIntensity ?? 50;
    switch (schoolProfile.backgroundImageEffect) {
        case 'grayscale': filters.push(`grayscale(${intensity}%)`); break;
        case 'sepia': filters.push(`sepia(${intensity}%)`); break;
        case 'darken': overlayStyle.backgroundColor = `rgba(0, 0, 0, ${intensity / 100})`; break;
        case 'lighten': overlayStyle.backgroundColor = `rgba(255, 255, 255, ${intensity / 100})`; break;
    }
    if (filters.length > 0) {
        imageStyle.filter = filters.join(' ');
    }

    const commonBg = (className = '') => (
        <div className={`absolute inset-0 z-0 ${className}`}>
            <SchoolBackgroundImage 
                hasBackgroundImage={schoolProfile.hasBackgroundImage} 
                alt="School background" 
                className="w-full h-full object-cover"
                style={imageStyle}
            />
            <div className="absolute inset-0" style={overlayStyle}></div>
        </div>
    );

    const ContactInfo: React.FC<{ profile: SchoolProfile, iconClassName?: string, textClassName?: string, containerClassName?: string }> = ({ profile, iconClassName, textClassName, containerClassName }) => (
        <div className={`space-y-2 text-sm ${containerClassName}`}>
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 flex-shrink-0 ${iconClassName}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className={textClassName}>{profile.schoolAddress}</span>
            </div>
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 flex-shrink-0 ${iconClassName}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className={textClassName}>{profile.schoolNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 flex-shrink-0 ${iconClassName}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>
                <span className={textClassName}>ID: {profile.schoolId}</span>
            </div>
        </div>
    );

    switch (style) {
        case 'style2': // Classic Split
            return (
                <div className="neo-container rounded-2xl p-0 overflow-hidden h-[28rem] flex">
                    <div className="w-1/2 h-full relative group">
                        <SchoolBackgroundImage hasBackgroundImage={schoolProfile.hasBackgroundImage} alt="School background" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" style={imageStyle}/>
                        <div className="absolute inset-0" style={overlayStyle}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                            <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="neo-container rounded-full p-1 w-16 h-16 border-2 border-white/50" style={logoStyle} />
                        </div>
                    </div>
                    <div className="w-1/2 p-6 flex flex-col justify-center">
                        <span className="text-xs font-bold text-blue-600 mb-2">Session: {schoolProfile.session}</span>
                        <h2 className="text-2xl font-extrabold">{schoolProfile.name}</h2>
                        <p className="text-md font-medium text-gray-600 mb-4">"{schoolProfile.motto}"</p>
                        <ContactInfo profile={schoolProfile} containerClassName='border-t pt-4' />
                    </div>
                </div>
            );

        case 'style3': // Minimal Overlay
            return (
                <div className="neo-container rounded-2xl p-0 overflow-hidden relative h-[28rem] group text-white">
                    {commonBg()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                    <div className="relative z-20 h-full flex flex-col justify-end p-6">
                        <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="absolute top-4 right-4 neo-container rounded-full p-1 w-12 h-12 border-2 border-white/50" style={logoStyle} />
                        <h2 className="text-3xl font-extrabold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_60%)]">{schoolProfile.name}</h2>
                        <p className="text-lg font-medium opacity-90 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)] mb-4">"{schoolProfile.motto}"</p>
                        <ContactInfo profile={schoolProfile} containerClassName='border-t border-white/30 pt-4 text-white/90' textClassName='[text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]' />
                    </div>
                </div>
            );

        case 'style4': // Centered Focus
            return (
                <div className="neo-container rounded-2xl p-0 overflow-hidden relative h-[28rem]">
                    <div className="absolute inset-0">
                        <SchoolBackgroundImage hasBackgroundImage={schoolProfile.hasBackgroundImage} alt="School background" className="w-full h-full object-cover" style={{ filter: 'blur(8px) ' + (imageStyle.filter || '') }} />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                    <div className="relative z-10 flex items-center justify-center h-full p-4">
                        <div className="neo-container rounded-2xl p-8 text-center max-w-sm w-full">
                            <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="neo-container rounded-full p-1 w-20 h-20 mx-auto -mt-16 mb-4 border-4" style={logoStyle} />
                            <h2 className="text-3xl font-extrabold">{schoolProfile.name}</h2>
                            <p className="text-md font-medium text-gray-600 mb-4">"{schoolProfile.motto}"</p>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-4">Session: {schoolProfile.session}</span>
                            <ContactInfo profile={schoolProfile} containerClassName='border-t pt-4' />
                        </div>
                    </div>
                </div>
            );

        case 'style5': // Side Info Bar
            return (
                <div className="neo-container rounded-2xl p-0 overflow-hidden h-[28rem] flex">
                    <div className="w-2/3 h-full relative group">
                        <SchoolBackgroundImage hasBackgroundImage={schoolProfile.hasBackgroundImage} alt="School background" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" style={imageStyle}/>
                        <div className="absolute inset-0" style={overlayStyle}></div>
                    </div>
                    <div className="w-1/3 p-4 flex flex-col justify-between">
                        <div className="text-center">
                            <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="neo-container rounded-full p-1 w-16 h-16 mx-auto mb-2" style={logoStyle} />
                            <h2 className="text-xl font-extrabold">{schoolProfile.name}</h2>
                            <p className="text-xs font-medium text-gray-600 mb-4">"{schoolProfile.motto}"</p>
                        </div>
                        <ContactInfo profile={schoolProfile} containerClassName='text-xs' />
                        <div className="text-center text-xs text-gray-500 border-t pt-2">
                            Session: {schoolProfile.session}
                        </div>
                    </div>
                </div>
            );

        case 'style1': // Glassmorphic Panel (Default)
        default:
            return (
                <div className="neo-container rounded-2xl p-0 overflow-hidden relative h-[28rem] group">
                    {commonBg('transition-all duration-500 group-hover:scale-110')}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20"></div>

                    <div className="relative z-10 p-6 text-center text-white">
                        <h2 className="text-3xl font-extrabold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_60%)]">{schoolProfile.name}</h2>
                        <p className="text-lg font-medium opacity-90 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_60%)]">"{schoolProfile.motto}"</p>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 group-hover:bottom-6">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            <SchoolLogo hasLogo={schoolProfile.hasLogo} alt="School Logo" className="neo-container rounded-full p-1 w-16 h-16 border-2 border-white/50" style={logoStyle} />
                        </div>
                        <div className="mt-8 text-center text-white">
                            <div className="inline-block bg-blue-500/50 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                Session: {schoolProfile.session}
                            </div>
                            <ContactInfo profile={schoolProfile} containerClassName='text-white/90' textClassName='[text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]' />
                        </div>
                    </div>
                </div>
            );
    }
};

export default SchoolProfileCard;