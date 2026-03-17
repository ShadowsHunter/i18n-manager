import * as XLSX from 'xlsx';
import { ErrorCode } from '../types/api';

export interface ParsedEntry {
  uuid: string;
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
 * - First row: headers (UUID, CN, EN, DE, ES, FI, FR, IT, NL, NO, PL, SE)
 * - Subsequent rows: entry data
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

    // Validate headers
    const requiredHeaders = [
      'UUID',
      'CN',
      'EN',
      'DE',
      'ES',
      'FI',
      'FR',
      'IT',
      'NL',
      'NO',
      'PL',
      'SE',
    ];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Missing required columns: ${missingHeaders.join(', ')}`,
      };
    }

    // Process entries
    const entries: ParsedEntry[] = [];
    const errors: string[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const entryId = `entry-${i}`;

      try {
        // Extract UUID (required)
        const uuid = row['UUID']?.toString().trim();
        if (!uuid) {
          errors.push(`Row ${i + 1}: Missing UUID`);
          continue;
        }

        // Extract translations for each language
        const entry: ParsedEntry = {
          uuid,
          projectId,
          cn: row['CN']?.toString().trim() || undefined,
          en: row['EN']?.toString().trim() || undefined,
          de: row['DE']?.toString().trim() || undefined,
          es: row['ES']?.toString().trim() || undefined,
          fi: row['FI']?.toString().trim() || undefined,
          fr: row['FR']?.toString().trim() || undefined,
          it: row['IT']?.toString().trim() || undefined,
          nl: row['NL']?.toString().trim() || undefined,
          no: row['NO']?.toString().trim() || undefined,
          pl: row['PL']?.toString().trim() || undefined,
          se: row['SE']?.toString().trim() || undefined,
        };

        // Validate entry has at least one translation
        const hasTranslation = Object.values(entry).some(
          (val) => val !== undefined && val !== '' && val !== null
        );

        if (!hasTranslation) {
          errors.push(`Row ${i + 1}: Entry ${uuid} has no translations`);
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
      xml += `  <string name="${entry.uuid}">${entry.cn}</string>\n`;
    }
    if (entry.en) {
      xml += `  <string name="${entry.uuid}">${entry.en}</string>\n`;
    }
    if (entry.de) {
      xml += `  <string name="${entry.uuid}">${entry.de}</string>\n`;
    }
    if (entry.es) {
      xml += `  <string name="${entry.uuid}">${entry.es}</string>\n`;
    }
    if (entry.fi) {
      xml += `  <string name="${entry.uuid}">${entry.fi}</string>\n`;
    }
    if (entry.fr) {
      xml += `  <string name="${entry.uuid}">${entry.fr}</string>\n`;
    }
    if (entry.it) {
      xml += `  <string name="${entry.uuid}">${entry.it}</string>\n`;
    }
    if (entry.nl) {
      xml += `  <string name="${entry.uuid}">${entry.nl}</string>\n>`;
    }
    if (entry.no) {
      xml += `  <string name="${entry.uuid}">${entry.no}</string>\n>`;
    }
    if (entry.pl) {
      xml += `  <string name="${entry.uuid}">${entry.pl}</string>\n>`;
    }
    if (entry.se) {
      xml += `  <string name="${entry.uuid}">${entry.se}</string>\n>`;
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
    content += `"${entry.uuid}" = `;

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
