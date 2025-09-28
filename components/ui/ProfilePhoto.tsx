import React, { useState, useEffect } from 'react';
import { getUserPhoto } from '../../utils/db';

interface ProfilePhotoProps {
    userId: string;
    hasPhoto: boolean;
    className?: string;
    alt: string;
}

const placeholder = 'https://placehold.co/128x128/E0E5EC/606F87?text=User';

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ userId, hasPhoto, className, alt }) => {
    const [imageUrl, setImageUrl] = useState(placeholder);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const loadPhoto = async () => {
            if (hasPhoto) {
                try {
                    const blob = await getUserPhoto(userId);
                    if (isMounted && blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    } else if (isMounted) {
                        setImageUrl(placeholder);
                    }
                } catch (err) {
                    console.error("Failed to load user photo for", userId, err);
                    if (isMounted) setImageUrl(placeholder);
                }
            } else {
                setImageUrl(placeholder);
            }
        };

        loadPhoto();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [userId, hasPhoto]);

    return <img src={imageUrl} alt={alt} className={className} />;
};

export default ProfilePhoto;
