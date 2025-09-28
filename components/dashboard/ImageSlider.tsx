import React, { useState, useEffect, useMemo } from 'react';
import { getAllGalleryImages, getAllGalleryImageKeys } from '../../utils/db';
import useSchoolProfile from '../../hooks/useSchoolProfile';
import useLocalStorage from '../../hooks/useLocalStorage';

const SLIDER_PLACEHOLDERS = [
    'https://placehold.co/800x400/a3b1c6/FFFFFF/png?text=Upload+Images+in+Settings',
    'https://placehold.co/800x400/3b82f6/FFFFFF/png?text=School+Campus',
    'https://placehold.co/800x400/22c55e/FFFFFF/png?text=Annual+Sports+Day',
];

interface ImageSliderProps {
    duration: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ duration }) => {
    const [schoolProfile] = useSchoolProfile();
    const [images, setImages] = useState<{ key: IDBValidKey, url: string }[]>([]);
    const [captions] = useLocalStorage<Record<string, string>>('galleryImageCaptions', {});
    const [imageOrder] = useLocalStorage<IDBValidKey[]>('galleryImageOrder', []);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const orderedImages = useMemo(() => {
        if (imageOrder.length === 0 || images.length === 0) return images;
        const imageMap = new Map(images.map(img => [img.key, img]));
        const ordered = imageOrder.map(key => imageMap.get(key)).filter(Boolean) as { key: IDBValidKey; url: string }[];
        return ordered.length > 0 ? ordered : images;
    }, [images, imageOrder]);
    
    useEffect(() => {
        let objectUrls: string[] = [];
        const loadImages = async () => {
            try {
                const imageBlobs = await getAllGalleryImages();
                if (imageBlobs.length > 0) {
                    const imageKeys = await getAllGalleryImageKeys();
                    const loadedImages = imageKeys.map((key, i) => ({
                        key,
                        url: URL.createObjectURL(imageBlobs[i]),
                    }));
                    objectUrls = loadedImages.map(img => img.url);
                    setImages(loadedImages);
                } else {
                    setImages(SLIDER_PLACEHOLDERS.map((url, i) => ({ key: `ph-${i}`, url })));
                }
            } catch (error) {
                console.error("Failed to load slider images:", error);
                setImages(SLIDER_PLACEHOLDERS.map((url, i) => ({ key: `ph-${i}`, url })));
            }
        };
        loadImages();

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    useEffect(() => {
        if (orderedImages.length <= 1) return;
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % orderedImages.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, orderedImages.length, duration]);

    if (!schoolProfile.isSliderEnabled) {
        return null;
    }

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (orderedImages.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + orderedImages.length) % orderedImages.length);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (orderedImages.length <= 1) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % orderedImages.length);
    };

    return (
        <>
            <div className="neo-container rounded-2xl p-4 h-64 md:h-80 relative overflow-hidden">
                <div
                    className="w-full h-full rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(orderedImages[currentIndex]?.url)}
                >
                    {orderedImages.map((image, index) => {
                        const caption = captions[String(image.key)];
                        const isSlideTransition = schoolProfile.sliderTransitionEffect === 'slide';
                        const transitionClass = isSlideTransition
                            ? 'transition-transform duration-1000 ease-in-out'
                            : `transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`;

                        const style = isSlideTransition
                            ? { transform: `translateX(${(index - currentIndex) * 100}%)` }
                            : {};
                        
                        return (
                            <div
                                key={image.key.toString()}
                                className={`absolute inset-0 w-full h-full ${transitionClass}`}
                                style={style}
                            >
                                <img src={image.url} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                                {caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                        <p className="text-white text-sm font-semibold [text-shadow:_1px_1px_2px_rgb(0_0_0_/_70%)]">{caption}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {orderedImages.length > 1 && <>
                <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 neo-button rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 neo-button rounded-full p-2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {orderedImages.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-400'}`}
                        />
                    ))}
                </div>
                </>}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[2001]"
                    style={{ animation: 'fadeIn 0.3s ease-in-out' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage}
                            alt="Full screen preview"
                            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-3 -right-3 neo-button bg-white text-black rounded-full p-2 shadow-lg"
                            aria-label="Close image preview"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageSlider;