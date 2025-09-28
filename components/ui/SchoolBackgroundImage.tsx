import React, { useState, useEffect } from 'react';
import { getSchoolAsset } from '../../utils/db';

interface SchoolBackgroundImageProps {
    hasBackgroundImage: boolean;
    className?: string;
    alt: string;
    style?: React.CSSProperties;
}

const placeholder = 'https://placehold.co/300x150/E0E5EC/606F87?text=Background';
const BACKGROUND_KEY = 'school_background_image';

const SchoolBackgroundImage: React.FC<SchoolBackgroundImageProps> = ({ hasBackgroundImage, className, alt, style }) => {
    const [imageUrl, setImageUrl] = useState(placeholder);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const loadBg = async () => {
            if (hasBackgroundImage) {
                try {
                    const blob = await getSchoolAsset(BACKGROUND_KEY);
                    if (isMounted && blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    } else if (isMounted) {
                        setImageUrl(placeholder);
                    }
                } catch (err) {
                    console.error("Failed to load school background image", err);
                    if (isMounted) setImageUrl(placeholder);
                }
            } else {
                setImageUrl(placeholder);
            }
        };

        loadBg();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [hasBackgroundImage]);

    return <img src={imageUrl} alt={alt} className={className} style={style} />;
};

export default SchoolBackgroundImage;