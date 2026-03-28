/**
 * EntryService - 使用 Supabase 客户端访问数据库
 * 提供文本条目管理功能
 */

import { supabase, handleSupabaseError } from '../lib/supabase';

export type EntryStatus = 'NEW' | 'TRANSLATED' | 'REVIEWED' | 'ERROR';

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
   * Get all entries for a project with filters and pagination
   */
  async getEntries(projectId: string, filters?: EntryFilters): Promise<PaginatedEntries> {
    const { status, search, language, skip = 0, take = 100 } = filters || {};

    let query = supabase.from('entries').select('*', { count: 'exact' });

    // Apply project filter
    query = query.eq('projectid', projectId);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      if (language) {
        // Search in specific language
        const languageField = this.getSearchField(language);
        query = query.or(`key.ilike.%${search}%,${languageField}.ilike.%${search}%`);
      } else {
        // Search in key only for better performance
        query = query.ilike('key', `%${search}%`);
      }
    }

    // Apply pagination
    query = query.order('updatedat', { ascending: false }).range(skip, skip + take - 1);

    const { data: entries, error, count } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    // Map database fields to Entry interface
    // Note: Supabase returns field names in lowercase without underscores
    const mappedEntries =
      entries?.map((entry) => ({
        id: entry.id,
        projectId: entry.projectid || entry.projectid,
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
      })) || [];

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

    return {
      id: entry.id,
      projectId: entry.projectid || entry.projectid,
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

  /**
   * Create a new entry
   */
  async createEntry(input: CreateEntryInput): Promise<Entry> {
    // Verify project exists
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

    // Create entry
    const insertData: Record<string, any> = {
      projectid: input.projectId,
      key: input.key,
      ...Object.fromEntries(Object.entries(input.translations).filter(([_, v]) => v !== undefined)),
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

    return {
      id: entry.id,
      projectId: entry.projectid || entry.projectid,
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

  /**
   * Update an entry
   */
  async updateEntry(projectId: string, uuid: string, input: UpdateEntryInput): Promise<Entry> {
    // Verify entry exists
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

    // Prepare update data
    const updateData: any = {};
    if (input.key !== undefined) updateData.key = input.key;
    if (input.translations !== undefined) {
      Object.keys(input.translations).forEach((lang) => {
        updateData[lang] = input.translations[lang];
      });
    }
    if (input.status !== undefined) updateData.status = input.status;
    if (input.error !== undefined) updateData.error = input.error;

    // Update entry
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

    return {
      id: entry.id,
      projectId: entry.projectid || entry.projectid,
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

  /**
   * Delete an entry
   */
  async deleteEntry(projectId: string, uuid: string) {
    // Verify entry exists
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

    // Delete entry
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

    // Verify all entries exist and belong to project
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

    // Prepare update data
    const updateData: any = {};
    if (updates.translations) {
      Object.keys(updates.translations).forEach((lang) => {
        updateData[lang] = updates.translations[lang];
      });
    }
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.error !== undefined) updateData.error = updates.error;

    // Update all entries
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
    // Verify all entries exist and belong to project
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

    // Delete entries
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
    // Verify project exists
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

    // Prepare entries for insertion
    const entriesToInsert = entries.map((entry) => ({
      projectid: projectId,
      key: entry.key,
      ...entry.translations,
      status: 'NEW',
    }));

    // Insert all entries
    const { data: createdEntries, error } = await supabase
      .from('entries')
      .insert(entriesToInsert)
      .select();

    if (error) {
      handleSupabaseError(error);
    }

    // Map database fields to Entry interface
    const mappedEntries = createdEntries.map((entry) => ({
      id: entry.id,
      projectId: entry.projectid || entry.projectid,
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
    }));

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
    // Get total count
    const { count: total } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('projectid', projectId);

    // Get counts by status
    const { data: byStatus } = await supabase
      .from('entries')
      .select('status, count')
      .eq('projectid', projectId);

    // Convert to Record format
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
