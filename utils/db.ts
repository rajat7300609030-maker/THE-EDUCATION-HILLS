// FIX: Removed self-imports that were causing circular dependency errors, and an unused types import.

const DB_NAME = 'LMS_DB';
const DB_VERSION = 3; // Version bumped to introduce new object stores
export const STUDENT_PHOTOS_STORE = 'student_photos';
export const USER_PHOTOS_STORE = 'user_photos';
export const SCHOOL_ASSETS_STORE = 'school_assets';
export const GALLERY_IMAGES_STORE = 'gallery_images';

let db: IDBDatabase;

export function initDB(): Promise<boolean> {
  return new Promise((resolve) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      resolve(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STUDENT_PHOTOS_STORE)) {
        dbInstance.createObjectStore(STUDENT_PHOTOS_STORE);
      }
      if (!dbInstance.objectStoreNames.contains(USER_PHOTOS_STORE)) {
        dbInstance.createObjectStore(USER_PHOTOS_STORE);
      }
      if (!dbInstance.objectStoreNames.contains(SCHOOL_ASSETS_STORE)) {
        dbInstance.createObjectStore(SCHOOL_ASSETS_STORE);
      }
       if (!dbInstance.objectStoreNames.contains(GALLERY_IMAGES_STORE)) {
        dbInstance.createObjectStore(GALLERY_IMAGES_STORE, { autoIncrement: true });
      }
    };
  });
}

// --- Generic DB Functions ---

function getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return new Promise((resolve, reject) => {
        if (!db) {
            initDB().then(success => {
                if(success) {
                    const transaction = db.transaction(storeName, mode);
                    resolve(transaction.objectStore(storeName));
                } else {
                    reject('DB not initialized');
                }
            });
        } else {
            const transaction = db.transaction(storeName, mode);
            resolve(transaction.objectStore(storeName));
        }
    });
}

export function getAllEntries<T>(storeName: string): Promise<{ key: IDBValidKey; value: T }[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const store = await getStore(storeName, 'readonly');
            const request = store.openCursor();
            const entries: { key: IDBValidKey; value: T }[] = [];
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    entries.push({ key: cursor.key, value: cursor.value });
                    cursor.continue();
                } else {
                    resolve(entries);
                }
            };
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
}

export function clearStore(storeName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const store = await getStore(storeName, 'readwrite');
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
}


function putData(storeName: string, data: any, key?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise(async (resolve, reject) => {
        const store = await getStore(storeName, 'readwrite');
        const request = store.put(data, key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getData<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise(async (resolve, reject) => {
        const store = await getStore(storeName, 'readonly');
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
    });
}

export function deleteData(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const store = await getStore(storeName, 'readwrite');
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// FIX: Exported function to make it available to other modules.
export function getAllData<T>(storeName: string): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
        const store = await getStore(storeName, 'readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
    });
}

function getAllKeys(storeName: string): Promise<IDBValidKey[]> {
    return new Promise(async (resolve, reject) => {
        const store = await getStore(storeName, 'readonly');
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// --- Student Photo Functions ---
export const setImage = (id: string, blob: Blob) => putData(STUDENT_PHOTOS_STORE, blob, id);
export const getImage = (id: string) => getData<Blob>(STUDENT_PHOTOS_STORE, id);
export const deleteImage = (id: string) => deleteData(STUDENT_PHOTOS_STORE, id);

// --- User Photo Functions ---
export const setUserPhoto = (id: string, blob: Blob) => putData(USER_PHOTOS_STORE, blob, id);
export const getUserPhoto = (id: string) => getData<Blob>(USER_PHOTOS_STORE, id);

// --- School Asset Functions ---
export const setSchoolAsset = (id: string, blob: Blob) => putData(SCHOOL_ASSETS_STORE, blob, id);
export const getSchoolAsset = (id: string) => getData<Blob>(SCHOOL_ASSETS_STORE, id);

// --- Gallery Image Functions ---
export const addGalleryImage = (blob: Blob) => putData(GALLERY_IMAGES_STORE, blob);
export const getAllGalleryImages = () => getAllData<Blob>(GALLERY_IMAGES_STORE);
export const getAllGalleryImageKeys = () => getAllKeys(GALLERY_IMAGES_STORE);
export const deleteGalleryImage = (key: IDBValidKey) => deleteData(GALLERY_IMAGES_STORE, key);