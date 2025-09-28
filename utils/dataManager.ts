import { Student, Class } from '../types';

// --- CSV EXPORT ---
function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            const escaped = ('' + value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const exportToCsv = (dataType: 'students' | 'classes') => {
    try {
        const data = JSON.parse(localStorage.getItem(dataType) || '[]');
        if (data.length === 0) {
            alert(`No ${dataType} data to export.`);
            return;
        }
        
        let processedData = data;
        if (dataType === 'students') {
            processedData = data.map((item: Student) => {
                const { paymentHistory, ...rest } = item;
                return {
                    ...rest,
                    paymentHistoryCount: paymentHistory?.length || 0,
                };
            });
        }

        const csv = convertToCSV(processedData);
        downloadFile(csv, `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
        console.error(`Error exporting ${dataType} to CSV:`, error);
        alert(`Failed to export ${dataType}.`);
    }
};


// --- BACKUP & RESTORE ---
const LOCALSTORAGE_KEYS = ['students', 'classes', 'users', 'schoolProfile', 'feeStructure', 'inquiries', 'notifications', 'theme', 'isLoggedIn', 'feesTypes'];

export const downloadBackup = async () => {
    try {
        const localStorageData: { [key: string]: any } = {};
        LOCALSTORAGE_KEYS.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    localStorageData[key] = JSON.parse(item);
                } catch {
                    localStorageData[key] = item;
                }
            }
        });
        
        // Note: IndexedDB data (images) is not included in this simple backup.
        
        const backupData = {
            timestamp: new Date().toISOString(),
            localStorage: localStorageData,
        };
        
        const jsonString = JSON.stringify(backupData, null, 2);
        downloadFile(jsonString, `school_lms_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (error) {
        console.error('Backup failed:', error);
        alert('Failed to create backup.');
    }
};

export const restoreBackup = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backupData = JSON.parse(event.target?.result as string);
                if (!backupData.localStorage) {
                    throw new Error("Invalid backup file structure.");
                }
                
                localStorage.clear();

                for (const key in backupData.localStorage) {
                    if (Object.prototype.hasOwnProperty.call(backupData.localStorage, key)) {
                        localStorage.setItem(key, JSON.stringify(backupData.localStorage[key]));
                    }
                }
                
                // Note: Image data from IndexedDB is not handled by this simple restore.
                alert("Data restored. Images and school assets may need to be re-uploaded.");
                
                resolve();
            } catch (error) {
                console.error("Restore error:", error);
                reject(new Error('Invalid backup file format or restore failed.'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read the backup file.'));
        reader.readAsText(file);
    });
};

// --- PRINT & PDF ---

export const printReport = () => {
    alert("This will print the current page. For a full report, navigate to the desired page (e.g., All Students) and then print.");
    window.print();
};

export const downloadPdfReport = () => {
    alert("This feature uses the browser's print functionality. Choose 'Save as PDF' in the print dialog to create a PDF file.");
    window.print();
};
