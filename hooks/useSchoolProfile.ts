
import { useMemo, Dispatch, SetStateAction } from 'react';
import useLocalStorage from './useLocalStorage';
import { SchoolProfile } from '../types';

const defaultProfile: SchoolProfile = {
  name: 'The Education Hills',
  motto: 'Knowledge Is Power',
  session: '2025-2026',
  hasLogo: false,
  schoolNumber: '011-12345678',
  schoolId: 'CBSE/AFF/12345',
  schoolAddress: 'Pratappur Road, Dikhtauli, Shikohabad, Firozabad, UP 283135',
  hasBackgroundImage: false,
  backgroundImageEffect: 'none',
  backgroundImageEffectIntensity: 50,
  backgroundImageBlur: 0,
  profileCardStyle: 'style1',
  sliderDuration: 5000,
  logoSize: 100,
  isSliderEnabled: true,
  sliderTransitionEffect: 'fade',
};

// Fix: Imported Dispatch and SetStateAction and used them to type the return value.
function useSchoolProfile(): [SchoolProfile, Dispatch<SetStateAction<SchoolProfile>>] {
  const [profile, setProfile] = useLocalStorage<SchoolProfile>('schoolProfile', defaultProfile);

  // Ensure that the loaded profile has all the default keys, in case the stored object is partial
  const mergedProfile = useMemo(() => {
    return { ...defaultProfile, ...profile };
  }, [profile]);


  return [mergedProfile, setProfile];
}

export default useSchoolProfile;