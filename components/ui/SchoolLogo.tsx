import React, { useState, useEffect } from 'react';
import { getSchoolAsset } from '../../utils/db';

interface SchoolLogoProps {
    hasLogo: boolean;
    className?: string;
    alt: string;
    style?: React.CSSProperties;
}

const placeholder = 'https://placehold.co/128x128/E0E5EC/606F87?text=Logo';
const LOGO_KEY = 'school_logo';

const SchoolLogo: React.FC<SchoolLogoProps> = ({ hasLogo, className, alt, style }) => {
    const [imageUrl, setImageUrl] = useState(placeholder);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const loadLogo = async () => {
            if (hasLogo) {
                try {
                    const blob = await getSchoolAsset(LOGO_KEY);
                    if (isMounted && blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    } else if (isMounted) {
                        setImageUrl(placeholder);
                    }
                } catch (err) {
                    console.error("Failed to load school logo", err);
                    if (isMounted) setImageUrl(placeholder);
                }
            } else {
                setImageUrl(placeholder);
            }
        };

        loadLogo();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [hasLogo]);

    return <img src={imageUrl} alt={alt} className={className} style={style} />;
};

export default SchoolLogo;