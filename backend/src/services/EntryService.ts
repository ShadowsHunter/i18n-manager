/**
 * EntryService - 使用 Supabase 客户端访问数据库
 * 提供文本条目管理功能
 */

import { supabase, handleSupabaseError } from '../lib/supabase';

export type EntryStatus = 'NEW' | 'TRANSLATED' | 'REVIEWED' | 'ERROR';

// Known translation columns
const KNOWN_TRANSLATION_COLUMNS = [
  'cn',
  'en',
  'de',
  'es',
  'fi',
  'fr',
  'it',
  'nl',
  'no',
  'pl',
  'se',
  'da',
];

// Cached set of columns that actually exist in the entries table
let cachedAvailableColumns: Set<string> | null = null;

/**
 * Query the entries table once to discover which columns exist.
 * Caches the result for the lifetime of the process.
 */
async function getAvailableColumns(): Promise<Set<string>> {
  if (cachedAvailableColumns) return cachedAvailableColumns;

  try {
    const { data, error } = await supabase.from('entries').select('*').limit(1);
    if (error) {
      console.warn('[EntryService] Could not detect columns, using known set:', error.message);
      cachedAvailableColumns = new Set(KNOWN_TRANSLATION_COLUMNS);
      return cachedAvailableColumns;
    }

    if (data && data.length > 0) {
      cachedAvailableColumns = new Set(Object.keys(data[0]));
      console.log(
        '[EntryService] Detected columns:',
        Array.from(cachedAvailableColumns).join(', ')
      );
    } else {
      // No rows yet — check by inserting and deleting a dummy row
      const { data: projects } = await supabase.from('projects').select('id').limit(1);
      if (projects && projects.length > 0) {
        const testEntry = { projectid: projects[0].id, key: '__column_detect__', status: 'NEW' };
        const { data: inserted, error: insertError } = await supabase
          .from('entries')
          .insert([testEntry])
          .select()
          .single();
        if (inserted) {
          cachedAvailableColumns = new Set(Object.keys(inserted));
          await supabase.from('entries').delete().eq('id', inserted.id);
        }
      }

      if (!cachedAvailableColumns) {
        cachedAvailableColumns = new Set(KNOWN_TRANSLATION_COLUMNS);
      }
    }
  } catch {
    cachedAvailableColumns = new Set(KNOWN_TRANSLATION_COLUMNS);
  }

  return cachedAvailableColumns!;
}

/**
 * Filter a translations object to only include keys that are actual DB columns.
 */
async function filterTranslationsToExistingColumns(
  translations: Record<string, any>
): Promise<Record<string, any>> {
  const available = await getAvailableColumns();
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(translations)) {
    if (available.has(key.toLowerCase())) {
      filtered[key] = value;
    } else {
      console.warn(`[EntryService] Skipping unknown column "${key}" (not in entries table)`);
    }
  }
  return filtered;
}

/**
 * Map a raw Supabase row to our Entry interface.
 * Fields not in the DB will be undefined.
 */
function mapDbEntry(entry: any) {
  return {
    id: entry.id,
    projectId: entry.projectid,
    key: entry.key,
    cn: entry.cn,
    en: entry.en,
    de: entry.de,
    es: entry.es,
    fi: entry.fi,
    fr: entry.fr,
    it: entry.it,
    nl: entry.nl,
    no: entry.no,
    pl: entry.pl,
    se: entry.se,
    da: entry.da,
    status: entry.status,
    error: entry.error,
    createdAt: entry.createdat || entry.created_at,
    updatedAt: entry.updatedat || entry.updated_at,
  };
}

export interface CreateEntryInput {
  projectId: string;
  key: string;
  translations: Record<string, string>;
}

export interface UpdateEntryInput {
  key?: string;
  translations?: Record<string, string>;
  status?: EntryStatus;
  error?: string;
}

export interface EntryFilters {
  status?: EntryStatus;
  search?: string;
  language?: string;
  skip?: number;
  take?: number;
}

export interface BulkUpdateInput {
  uuids: string[];
  updates: Partial<UpdateEntryInput>;
}

export interface Entry {
  id: string;
  projectId: string;
  key: string;
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
  status: EntryStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEntries {
  entries: Entry[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface EntryStats {
  total: number;
  byStatus: Record<string, number>;
}

/**
 * Service for managing text entries
 */
export class EntryService {
  /**
   * Get ALL entries for a project (no pagination limit).
   * Supabase PostgREST has a default 1000-row limit per query,
   * so we paginate internally to fetch everything.
   */
  async getAllEntries(projectId: string): Promise<Entry[]> {
    const pageSize = 500;
    let allEntries: Entry[] = [];
    let hasMore = true;
    let skip = 0;

    while (hasMore) {
      const { data: entries, error } = await supabase
        .from('entries')
        .select('*')
        .eq('projectid', projectId)
        .order('updatedat', { ascending: false })
        .range(skip, skip + pageSize - 1);

      if (error) {
        handleSupabaseError(error);
      }

      if (!entries || entries.length === 0) {
        hasMore = false;
        break;
      }

      allEntries.push(...entries.map(mapDbEntry));
      skip += pageSize;

      if (entries.length < pageSize) {
        hasMore = false;
      }
    }

    return allEntries;
  }

  /**
   * Get all entries for a project with filters and pagination
   */
  async getEntries(projectId: string, filters?: EntryFilters): Promise<PaginatedEntries> {
    const { status, search, language, skip = 0, take = 100 } = filters || {};

    let query = supabase.from('entries').select('*', { count: 'exact' });

    query = query.eq('projectid', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      if (language) {
        const languageField = this.getSearchField(language);
        query = query.or('key.ilike.%' + search + '%,' + languageField + '.ilike.%' + search + '%');
      } else {
        // Search across ALL text fields when no specific language is specified
        const allFields = [
          'key',
          'cn',
          'en',
          'de',
          'es',
          'fi',
          'fr',
          'it',
          'nl',
          'no',
          'pl',
          'se',
          'da',
        ];
        const conditions = allFields
          .map(function (f) {
            return f + '.ilike.%' + search + '%';
          })
          .join(',');
        query = query.or(conditions);
      }
    }

    query = query.order('updatedat', { ascending: false }).range(skip, skip + take - 1);

    const { data: entries, error, count } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    const mappedEntries = entries?.map((entry) => mapDbEntry(entry)) || [];

    return {
      entries: mappedEntries,
      total: count || 0,
      pages: Math.ceil((count || 0) / take),
      currentPage: Math.floor(skip / take) + 1,
    };
  }

  /**
   * Get a single entry by UUID
   */
  async getEntryByUUID(projectId: string, uuid: string): Promise<Entry> {
    const { data: entry, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', uuid)
      .eq('projectid', projectId)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return mapDbEntry(entry);
  }

  /**
   * Create a new entry
   */
  async createEntry(input: CreateEntryInput): Promise<Entry> {
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', input.projectId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Filter translations to only include columns that exist in the DB
    const safeTranslations = await filterTranslationsToExistingColumns(
      Object.fromEntries(Object.entries(input.translations).filter(([_, v]) => v !== undefined))
    );

    const insertData: Record<string, any> = {
      projectid: input.projectId,
      key: input.key,
      ...safeTranslations,
      status: 'NEW',
    };

    const { data: entry, error } = await supabase
      .from('entries')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return mapDbEntry(entry);
  }

  /**
   * Update an entry
   */
  async updateEntry(projectId: string, uuid: string, input: UpdateEntryInput): Promise<Entry> {
    const { data: existing, error: fetchError } = await supabase
      .from('entries')
      .select('id')
      .eq('id', uuid)
      .eq('projectid', projectId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!existing) {
      throw new Error('ENTRY_NOT_FOUND');
    }

    // Prepare update data — filter translations to only columns that exist
    const updateData: Record<string, any> = {};
    if (input.key !== undefined) updateData.key = input.key;
    if (input.translations !== undefined) {
      const available = await getAvailableColumns();
      for (const lang of Object.keys(input.translations)) {
        if (available.has(lang.toLowerCase())) {
          updateData[lang] = input.translations[lang];
        } else {
          console.warn(`[EntryService] Skipping unknown column "${lang}" in update`);
        }
      }
    }
    if (input.status !== undefined) updateData.status = input.status;
    if (input.error !== undefined) updateData.error = input.error;

    const { data: entry, error } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', uuid)
      .eq('projectid', projectId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    return mapDbEntry(entry);
  }

  /**
   * Delete an entry
   */
  async deleteEntry(projectId: string, uuid: string) {
    const { data: existing, error: fetchError } = await supabase
      .from('entries')
      .select('id')
      .eq('id', uuid)
      .eq('projectid', projectId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!existing) {
      throw new Error('ENTRY_NOT_FOUND');
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', uuid)
      .eq('projectid', projectId);

    if (error) {
      handleSupabaseError(error);
    }
  }

  /**
   * Bulk update entries
   */
  async bulkUpdate(projectId: string, input: BulkUpdateInput) {
    const { uuids, updates } = input;

    const { data: entries, error: fetchError } = await supabase
      .from('entries')
      .select('id')
      .in('id', uuids)
      .eq('projectid', projectId);

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!entries || entries.length !== uuids.length) {
      throw new Error('SOME_ENTRIES_NOT_FOUND');
    }

    const updateData: Record<string, any> = {};
    if (updates.translations) {
      // Note: for bulk we accept the risk — skip column filtering for performance
      Object.keys(updates.translations).forEach((lang) => {
        updateData[lang] = updates.translations![lang];
      });
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.error !== undefined) updateData.error = updates.error;

    const { error } = await supabase
      .from('entries')
      .update(updateData)
      .in('id', uuids)
      .eq('projectid', projectId);

    if (error) {
      handleSupabaseError(error);
    }

    return {
      count: uuids.length,
      message: `Updated ${uuids.length} entries`,
    };
  }

  /**
   * Bulk delete entries
   */
  async bulkDelete(projectId: string, uuids: string[]) {
    const { data: entries, error: fetchError } = await supabase
      .from('entries')
      .select('id')
      .in('id', uuids)
      .eq('projectid', projectId);

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!entries || entries.length !== uuids.length) {
      throw new Error('SOME_ENTRIES_NOT_FOUND');
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .in('id', uuids)
      .eq('projectid', projectId);

    if (error) {
      handleSupabaseError(error);
    }

    return {
      count: uuids.length,
      message: `Deleted ${uuids.length} entries`,
    };
  }

  /**
   * Import entries from Excel data
   */
  async importEntries(projectId: string, entries: Array<CreateEntryInput>) {
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();

    if (fetchError) {
      handleSupabaseError(fetchError);
    }

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Filter translations to only columns that exist in the DB
    const available = await getAvailableColumns();
    const entriesToUpsert = entries.map((entry) => {
      const translations = Object.fromEntries(
        Object.entries(entry.translations).filter(
          ([k, v]) => v !== undefined && v !== null && available.has(k.toLowerCase())
        )
      );
      return {
        projectid: projectId,
        key: entry.key,
        ...translations,
        status: 'NEW',
      };
    });

    if (entriesToUpsert.length === 0) {
      return {
        count: 0,
        entries: [],
        message: 'No entries to import',
      };
    }

    // Upsert entries by key — if key already exists in this project, update it
    const { data: upsertedEntries, error } = await supabase
      .from('entries')
      .upsert(entriesToUpsert, { onConflict: 'projectid,key' })
      .select();

    if (error) {
      handleSupabaseError(error);
    }

    const mappedEntries = upsertedEntries.map((entry) => mapDbEntry(entry));

    return {
      count: mappedEntries.length,
      entries: mappedEntries,
      message: `Imported ${mappedEntries.length} entries`,
    };
  }

  /**
   * Get entry statistics for a project
   */
  async getEntryStats(projectId: string): Promise<EntryStats> {
    const { count: total } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('projectid', projectId);

    const { data: byStatus } = await supabase
      .from('entries')
      .select('status, count')
      .eq('projectid', projectId);

    const stats: Record<string, number> = {};
    byStatus?.forEach((item) => {
      if (item.status) {
        stats[item.status] = item.count;
      }
    });

    return {
      total: total || 0,
      byStatus: stats,
    };
  }

  /**
   * Helper method to get language field name
   */
  private getSearchField(language: string): string {
    const fieldMap: Record<string, string> = {
      EN: 'en',
      CN: 'cn',
      DE: 'de',
      ES: 'es',
      FI: 'fi',
      FR: 'fr',
      IT: 'it',
      NL: 'nl',
      NO: 'no',
      PL: 'pl',
      SE: 'se',
      DA: 'da',
    };
    return fieldMap[language.toUpperCase()] || language.toLowerCase();
  }
}

// Export singleton instance
export const entryService = new EntryService();
