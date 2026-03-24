import * as XLSX from 'xlsx';
import { ErrorCode } from '../types/api';
import * as crypto from 'crypto';

export interface ParsedEntry {
  key: string;
  projectId: string;
  cn?: string;
  en?: string;
  de?: string;
  es?: string;
  fi?: string;
  fr?: string;
  it?: string;
  nl?: string;
  no?: string;
  pl?: string;
  se?: string;
  da?: string;
}

export interface ParsedExcel {
  projectId: string;
  entries: ParsedEntry[];
  errors: string[];
  rowCount: number;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedExcel;
  error?: string;
}

/**
 * Parse Excel file and extract translation entries
 * Expected format:
 * - First row: headers (Key, CN, EN, DE, ES, FI, FR, IT, NL, NO, PL, SE, DA)
 * - Subsequent rows: entry data
 * - If Key is empty, a UUID will be generated automatically
 */
export const parseExcelFile = (buffer: Buffer, projectId: string): ParseResult => {
  try {
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return {
        success: false,
        error: 'Excel file is empty or invalid',
      };
    }

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const headers = data[0];

    if (!headers || headers.length === 0) {
      return {
        success: false,
        error: 'Excel file has no headers',
      };
    }

    // Validate headers - Key column is required
    const keyHeaderIndex = headers.findIndex((h: string) => h?.toString().toLowerCase() === 'key');
    if (keyHeaderIndex === -1) {
      return {
        success: false,
        error: 'Missing required column: Key (first column)',
      };
    }

    // Process entries
    const entries: ParsedEntry[] = [];
    const errors: string[] = [];

    // Find column indices (case-insensitive)
    const keyIndex = headers.findIndex((h: string) => h?.toString().toLowerCase() === 'key');
    const cnIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'CN');
    const enIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'EN');
    const deIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'DE');
    const esIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'ES');
    const fiIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'FI');
    const frIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'FR');
    const itIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'IT');
    const nlIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'NL');
    const noIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'NO');
    const plIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'PL');
    const seIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'SE');
    const daIndex = headers.findIndex((h: string) => h?.toString().toUpperCase() === 'DA');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      try {
        // Extract Key - if empty, generate UUID
        let keyValue = row[keyIndex]?.toString().trim();
        if (!keyValue) {
          // 如果 key 为空，则生成 UUID
          keyValue = crypto.randomUUID();
        }

        // Extract translations for each language
        const entry: ParsedEntry = {
          key: keyValue,
          projectId,
          cn: cnIndex >= 0 ? row[cnIndex]?.toString().trim() || undefined : undefined,
          en: enIndex >= 0 ? row[enIndex]?.toString().trim() || undefined : undefined,
          de: deIndex >= 0 ? row[deIndex]?.toString().trim() || undefined : undefined,
          es: esIndex >= 0 ? row[esIndex]?.toString().trim() || undefined : undefined,
          fi: fiIndex >= 0 ? row[fiIndex]?.toString().trim() || undefined : undefined,
          fr: frIndex >= 0 ? row[frIndex]?.toString().trim() || undefined : undefined,
          it: itIndex >= 0 ? row[itIndex]?.toString().trim() || undefined : undefined,
          nl: nlIndex >= 0 ? row[nlIndex]?.toString().trim() || undefined : undefined,
          no: noIndex >= 0 ? row[noIndex]?.toString().trim() || undefined : undefined,
          pl: plIndex >= 0 ? row[plIndex]?.toString().trim() || undefined : undefined,
          se: seIndex >= 0 ? row[seIndex]?.toString().trim() || undefined : undefined,
          da: daIndex >= 0 ? row[daIndex]?.toString().trim() || undefined : undefined,
        };

        // Validate entry has at least one translation
        const hasTranslation = [
          entry.cn,
          entry.en,
          entry.de,
          entry.es,
          entry.fi,
          entry.fr,
          entry.it,
          entry.nl,
          entry.no,
          entry.pl,
          entry.se,
          entry.da,
        ].some((val) => val !== undefined && val !== '');

        if (!hasTranslation) {
          errors.push(`Row ${i + 1}: Entry "${keyValue}" has no translations`);
        }

        entries.push(entry);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (entries.length === 0 && errors.length === 0) {
      return {
        success: false,
        error: 'No valid entries found in Excel file',
      };
    }

    return {
      success: true,
      data: {
        projectId,
        entries,
        errors,
        rowCount: data.length - 1, // Excluding header row
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing Excel file',
    };
  }
};

/**
 * Determine status of entry based on comparison with existing data
 * This would be implemented in service layer with database queries
 */
export const determineEntryStatus = (
  newEntry: ParsedEntry,
  existingEntry?: any
): 'NEW' | 'MODIFIED' => {
  if (!existingEntry) {
    return 'NEW';
  }

  // Compare with existing entry and return appropriate status
  const hasChanges = Object.keys(newEntry).some((key) => {
    const newValue = newEntry[key as string];
    const existingValue = existingEntry[key as string];
    return newValue !== undefined && newValue !== existingValue && newValue !== '';
  });

  return hasChanges ? 'MODIFIED' : 'NEW';
};

/**
 * Generate JSON export for entries
 */
export const generateJsonExport = (entries: any[]): string => {
  return JSON.stringify(entries, null, 2);
};

/**
 * Generate XML export for Android (strings.xml format)
 */
export const generateAndroidXml = (entries: any[], projectName: string): string => {
  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<resources>\n`;
  xml += `  <string name="app_name">${projectName}</string>\n`;

  entries.forEach((entry: any) => {
    if (entry.cn) {
      xml += `  <string name="${entry.key}">${entry.cn}</string>\n`;
    }
    if (entry.en) {
      xml += `  <string name="${entry.key}">${entry.en}</string>\n`;
    }
    if (entry.de) {
      xml += `  <string name="${entry.key}">${entry.de}</string>\n`;
    }
    if (entry.es) {
      xml += `  <string name="${entry.key}">${entry.es}</string>\n`;
    }
    if (entry.fi) {
      xml += `  <string name="${entry.key}">${entry.fi}</string>\n`;
    }
    if (entry.fr) {
      xml += `  <string name="${entry.key}">${entry.fr}</string>\n`;
    }
    if (entry.it) {
      xml += `  <string name="${entry.key}">${entry.it}</string>\n`;
    }
    if (entry.nl) {
      xml += `  <string name="${entry.key}">${entry.nl}</string>\n`;
    }
    if (entry.no) {
      xml += `  <string name="${entry.key}">${entry.no}</string>\n`;
    }
    if (entry.pl) {
      xml += `  <string name="${entry.key}">${entry.pl}</string>\n`;
    }
    if (entry.se) {
      xml += `  <string name="${entry.key}">${entry.se}</string>\n`;
    }
    if (entry.da) {
      xml += `  <string name="${entry.key}">${entry.da}</string>\n`;
    }
  });

  xml += `</resources>`;
  return xml;
};

/**
 * Generate iOS strings file (.strings format)
 */
export const generateIosStrings = (entries: any[], projectName: string): string => {
  let content = `/*\n *  ${projectName}\n *  Auto-generated by MultiLanguageManager\n *  Generated on ${new Date().toISOString()}\n */\n\n`;

  entries.forEach((entry: any) => {
    content += `"${entry.key}" = `;

    if (entry.cn) {
      content += `"${escapeString(entry.cn)}";\n`;
    }
    if (entry.en) {
      content += `"${escapeString(entry.en)}";\n`;
    }
    if (entry.de) {
      content += `"${escapeString(entry.de)}";\n`;
    }
    if (entry.es) {
      content += `"${escapeString(entry.es)}";\n`;
    }
    if (entry.fi) {
      content += `"${escapeString(entry.fi)}";\n`;
    }
    if (entry.fr) {
      content += `"${escapeString(entry.fr)}";\n`;
    }
    if (entry.it) {
      content += `"${escapeString(entry.it)}";\n`;
    }
    if (entry.nl) {
      content += `"${escapeString(entry.nl)}";\n`;
    }
    if (entry.no) {
      content += `"${escapeString(entry.no)}";\n`;
    }
    if (entry.pl) {
      content += `"${escapeString(entry.pl)}";\n`;
    }
    if (entry.se) {
      content += `"${escapeString(entry.se)}";\n`;
    }
    if (entry.da) {
      content += `"${escapeString(entry.da)}";\n`;
    }
  });

  return content;
};

/**
 * Escape special characters for iOS strings
 */
const escapeString = (str: string): string => {
  if (!str) return '';
  // Escape backslashes and quotes
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};
