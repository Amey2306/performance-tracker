
import * as XLSX from 'xlsx';

export const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

export const normalizeKeys = (row: any) => {
    const newRow: any = {};
    Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().trim();
        
        // Planning Keys
        if (lowerKey.includes('distribution') || lowerKey.includes('spend %')) newRow.distributionPercent = row[key];
        else if (lowerKey.includes('ltw') || lowerKey.includes('ad %')) newRow.ltwPercent = row[key];
        else if (lowerKey.includes('spend factor') || lowerKey.includes('active')) newRow.spendFactor = row[key];
        
        // Performance Keys (Achieved)
        else if (lowerKey.includes('achieved leads') || lowerKey === 'leads') newRow.leads = row[key];
        else if (lowerKey.includes('achieved ap') || lowerKey.includes('appointments') || lowerKey.includes('site visit')) newRow.appointments = row[key];
        else if (lowerKey.includes('achieved ad') || lowerKey.includes('walkin') || lowerKey.includes('walkins')) newRow.walkins = row[key];
        else if (lowerKey.includes('achieved spends') || lowerKey.includes('region spends') || lowerKey === 'spends') newRow.spends = row[key];
    });
    return newRow;
};
