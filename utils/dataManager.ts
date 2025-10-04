import { Student, Class } from '../types';

declare const html2canvas: any;
declare const jspdf: any;

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
    const mainContent = document.querySelector('main');
    if (!mainContent) {
        alert("Could not find main content to generate PDF.");
        return;
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.innerText = 'Generating PDF, please wait...';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.color = 'black';
    loadingMessage.style.backgroundColor = 'white';
    loadingMessage.style.border = '1px solid black';
    loadingMessage.style.borderRadius = '1rem';
    loadingMessage.style.zIndex = '9999';
    document.body.appendChild(loadingMessage);

    html2canvas(mainContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
        windowHeight: mainContent.scrollHeight,
    }).then((canvas: HTMLCanvasElement) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
        
        document.body.removeChild(loadingMessage);
    }).catch((err: any) => {
        console.error("PDF generation failed", err);
        alert("Failed to generate PDF.");
        document.body.removeChild(loadingMessage);
    });
};
