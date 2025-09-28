import React, { useState, useEffect, useRef, useMemo } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, SchoolProfile } from '../../../types';
import { addGalleryImage, getAllGalleryImages, deleteGalleryImage, getAllGalleryImageKeys } from '../../../utils/db';
import { useNotification } from '../../../contexts/NavigationContext';
import useSchoolProfile from '../../../hooks/useSchoolProfile';
import ToggleSwitch from '../../ui/ToggleSwitch';
import useLocalStorage from '../../../hooks/useLocalStorage';

const SchoolGalleryPage: React.FC = () => {
    const [schoolProfile, setSchoolProfile] = useSchoolProfile();
    const { addNotification } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [images, setImages] = useState<{ key: IDBValidKey; url: string }[]>([]);
    const [settings, setSettings] = useState<Partial<SchoolProfile>>({
        isSliderEnabled: schoolProfile.isSliderEnabled,
        sliderDuration: schoolProfile.sliderDuration,
        sliderTransitionEffect: schoolProfile.sliderTransitionEffect,
    });
    const [captions, setCaptions] = useLocalStorage<Record<string, string>>('galleryImageCaptions', {});
    const [imageOrder, setImageOrder] = useLocalStorage<IDBValidKey[]>('galleryImageOrder', []);

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

            if (imageOrder.length !== newImages.length) {
                const existingKeys = new Set(imageKeys);
                const newOrder = imageOrder.filter(key => existingKeys.has(key));
                const newKeys = imageKeys.filter(key => !imageOrder.includes(key));
                setImageOrder([...newOrder, ...newKeys]);
            }

        } catch (error) { addNotification('Could not load gallery images.', 'danger'); }
    };

    useEffect(() => {
        refreshImages();
        return () => {
            images.forEach(img => URL.revokeObjectURL(img.url));
        };
    }, []);

    const sortedImages = useMemo(() => {
        if (imageOrder.length === 0 || images.length === 0) return images;
        const imageMap = new Map(images.map(img => [img.key, img]));
        return imageOrder.map(key => imageMap.get(key)).filter(Boolean) as { key: IDBValidKey; url: string }[];
    }, [images, imageOrder]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        try {
            for (const file of Array.from(files)) await addGalleryImage(file);
            addNotification(`${files.length} image(s) added successfully.`, 'success');
            await refreshImages();
        } catch (error) { addNotification('Failed to upload images.', 'danger'); } 
        finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleDeleteImage = async (key: IDBValidKey) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteGalleryImage(key);
                setCaptions(prev => {
                    const newCaptions = {...prev};
                    delete newCaptions[String(key)];
                    return newCaptions;
                });
                setImageOrder(prev => prev.filter(k => k !== key));
                addNotification('Image deleted successfully.', 'info');
                await refreshImages();
            } catch(error) { addNotification('Failed to delete image.', 'danger'); }
        }
    };
    
    const handleSettingsSave = () => {
        setSchoolProfile(prev => ({...prev, ...settings}));
        addNotification('Slider settings saved successfully.', 'success');
    };

    const handleMove = (keyToMove: IDBValidKey, direction: 'up' | 'down') => {
        const index = imageOrder.indexOf(keyToMove);
        if (index === -1) return;
        
        const newOrder = [...imageOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setImageOrder(newOrder);
    };

    return (
        <PageWrapper page={Page.SchoolGallery}>
            <div className="space-y-6">
                <div className="neo-container rounded-xl p-6">
                    <h3 className="text-xl font-bold border-b pb-3 mb-4">Slider Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between"><label className="font-semibold">Enable Dashboard Slider</label><ToggleSwitch id="slider-enable" checked={settings.isSliderEnabled ?? true} onChange={(e) => setSettings(p => ({...p, isSliderEnabled: e.target.checked}))} /></div>
                           <div><label className="font-semibold block mb-2">Transition Effect</label><select value={settings.sliderTransitionEffect} onChange={e => setSettings(p => ({...p, sliderTransitionEffect: e.target.value as any}))} className="neo-button w-full p-2 rounded-md"><option value="fade">Fade</option><option value="slide">Slide</option></select></div>
                        </div>
                         <div>
                            <label className="font-semibold flex justify-between"><span>Image Duration</span><span className="font-bold text-blue-600">{ (settings.sliderDuration || 5000) / 1000 }s</span></label>
                            <input type="range" min="2000" max="15000" step="1000" value={settings.sliderDuration} onChange={e => setSettings(p => ({...p, sliderDuration: Number(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer neo-button mt-2" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 border-t pt-4"><button onClick={handleSettingsSave} className="neo-button-success rounded-xl px-4 py-2 text-sm font-semibold">Save Settings</button></div>
                </div>

                <div className="neo-container rounded-xl p-6">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <h3 className="text-xl font-bold">Manage Images ({images.length})</h3>
                        <button onClick={() => fileInputRef.current?.click()} className="neo-button-primary rounded-xl px-4 py-2 text-sm font-semibold flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4-4v12" /></svg><span>Upload Images</span></button>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    
                    {sortedImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedImages.map((image, index) => (
                          <div key={image.key.toString()} className="relative group neo-container p-2 rounded-lg">
                            <div className="flex space-x-3">
                                <img src={image.url} alt="Gallery item" className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-grow space-y-2">
                                    <input 
                                        type="text"
                                        placeholder="Add a caption..."
                                        value={captions[String(image.key)] || ''}
                                        onChange={(e) => setCaptions(prev => ({...prev, [String(image.key)]: e.target.value}))}
                                        className="neo-button w-full text-sm p-2 rounded-md"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleMove(image.key, 'up')} disabled={index === 0} className="neo-button rounded-full p-2 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
                                        <button onClick={() => handleMove(image.key, 'down')} disabled={index === sortedImages.length - 1} className="neo-button rounded-full p-2 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                                        <div className="flex-grow"></div>
                                        <button onClick={() => handleDeleteImage(image.key)} className="neo-button bg-red-500/80 text-white rounded-full p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                            </div>
                          </div>
                        ))}
                        </div>
                    ) : ( <p className="text-center py-8 text-gray-500">No images in the gallery. Upload some to see them here.</p> )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default SchoolGalleryPage;