import React, { useState, useEffect, useRef } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page } from '../../../types';
import { addGalleryImage, getAllGalleryImages, deleteGalleryImage, getAllGalleryImageKeys } from '../../../utils/db';
import { useNotification } from '../../../contexts/NavigationContext';
import useSchoolProfile from '../../../hooks/useSchoolProfile';

// --- Slider Preview Component (local to this file) ---
const SliderPreview: React.FC<{ images: { url: string }[], duration: number }> = ({ images, duration }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, duration);
        return () => clearTimeout(timer);
    }, [currentIndex, images, duration]);

    if (images.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center neo-container rounded-xl bg-gray-200">
                <p className="text-gray-500">Upload images to see a preview</p>
            </div>
        );
    }

    return (
        <div className="neo-container rounded-xl p-2 h-64 relative overflow-hidden">
            <div className="w-full h-full rounded-lg overflow-hidden">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image.url}
                        alt={`Slide ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-400'}`}
                    />
                ))}
            </div>
        </div>
    );
};


const SchoolGalleryPage: React.FC = () => {
    const [schoolProfile] = useSchoolProfile();
    const [images, setImages] = useState<{ key: IDBValidKey; url: string }[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addNotification } = useNotification();

    const refreshImages = async () => {
        try {
            const imageKeys = await getAllGalleryImageKeys();
            const imageBlobs = await getAllGalleryImages();
            const newImages = imageBlobs.map((blob, index) => ({
                key: imageKeys[index],
                url: URL.createObjectURL(blob),
            }));
            
            setImages(currentImages => {
                currentImages.forEach(img => URL.revokeObjectURL(img.url));
                return newImages;
            });
        } catch (error) {
            addNotification('Could not load gallery images.', 'danger');
        }
    };

    useEffect(() => {
        refreshImages();
        return () => {
            setImages(currentImages => {
                currentImages.forEach(img => URL.revokeObjectURL(img.url));
                return [];
            });
        };
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            for (const file of Array.from(files)) {
                await addGalleryImage(file);
            }
            addNotification(`${files.length} image(s) added successfully.`, 'success');
            await refreshImages();
        } catch (error) {
            addNotification('Failed to upload images.', 'danger');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (key: IDBValidKey) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteGalleryImage(key);
                addNotification('Image deleted successfully.', 'info');
                await refreshImages();
            } catch(error) {
                addNotification('Failed to delete image.', 'danger');
            }
        }
    };

    return (
        <PageWrapper page={Page.SchoolGallery}>
            <div className="space-y-6">
                <div className="neo-container rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 pb-3 mb-4">
                        <h3 className="text-xl font-bold">Dashboard Image Set</h3>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="neo-button-primary mt-4 sm:mt-0 rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4-4v12" /></svg>
                            <span>Upload Images</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>
                    
                    <SliderPreview images={images} duration={schoolProfile.sliderDuration || 5000} />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                      {images.map(image => (
                          <div
                            key={image.key.toString()}
                            className="relative group neo-container p-1 rounded-lg cursor-pointer"
                            onClick={() => setSelectedImage(image.url)}
                          >
                            <img src={image.url} alt="Gallery item" className="w-full h-24 object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(image.key);
                                }}
                                className="neo-button bg-red-500 text-white rounded-full p-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                     {images.length === 0 && (
                        <p className="text-center py-8 text-gray-500">No images in the gallery. Upload some to see them here and on the dashboard slider.</p>
                     )}
                </div>
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
        </PageWrapper>
    );
};

export default SchoolGalleryPage;
