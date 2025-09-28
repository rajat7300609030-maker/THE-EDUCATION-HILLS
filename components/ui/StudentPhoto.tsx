
import React, { useState, useEffect } from 'react';
import { getImage } from '../../utils/db';

interface StudentPhotoProps {
    studentId: string;
    hasPhoto: boolean;
    className?: string;
    alt: string;
}

const placeholder = 'https://placehold.co/80x80/E0E5EC/606F87?text=Student';

const StudentPhoto: React.FC<StudentPhotoProps> = ({ studentId, hasPhoto, className, alt }) => {
    const [imageUrl, setImageUrl] = useState(placeholder);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const loadPhoto = async () => {
            if (hasPhoto) {
                try {
                    const blob = await getImage(studentId);
                    if (isMounted && blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    } else if (isMounted) {
                        setImageUrl(placeholder);
                    }
                } catch (err) {
                    console.error("Failed to load image for", studentId, err);
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
    }, [studentId, hasPhoto]);

    return <img src={imageUrl} alt={alt} className={className} />;
};

export default StudentPhoto;
