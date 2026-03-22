import { Router, Request, Response } from 'express';
import {
  successResponse,
  notFoundResponse,
  sendResponse,
  validationErrorResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';
import { optionalAuthenticate } from '../middleware/auth';
import upload, { handleFileUploadError, validateFileUpload } from '../middleware/fileUpload';
import { parseExcelFile } from '../utils/excelParser';
import { randomUUID } from 'crypto';

const router = Router();

// Mock data for development (replace with database queries)
const mockEntries: any[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    key: 'welcome_message',
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    cn: '确定',
    en: 'OK',
    de: 'OK',
    es: 'Aceptar',
    fi: 'OK',
    fr: 'Valider',
    it: 'OK',
    nl: 'OK',
    no: 'OK',
    pl: 'OK',
    se: 'OK',
    status: 'NEW',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
  },
  {
    id: '6ba7b810-9dad-11d1-80b7-44d45553535000',
    uuid: '6ba7b810-9dad-11d1-80b7-44d45553535000',
    key: 'cancel_button',
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    cn: '取消',
    en: 'Cancel',
    de: 'Abbrechen',
    es: 'Cancelar',
    fi: 'Peruuta',
    fr: 'Annuler',
    it: 'Annulla',
    nl: 'Annuleren',
    no: 'Avbryt',
    pl: 'Anuluj',
    se: 'Avbryt',
    status: 'MODIFIED',
    createdAt: '2026-01-15T14:00:00Z',
    updatedAt: '2026-02-28T16:45:00Z',
  },
  {
    id: '9b1deb4d-3b7d-4b77-c9df-08e877f1ef',
    uuid: '9b1deb4d-3b7d-4b77-c9df-08e877f1ef',
    key: 'settings_button',
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    cn: '设置',
    en: 'Settings',
    de: 'Einstellungen',
    es: 'Configuración',
    fi: 'Asetukset',
    fr: 'Paramètres',
    it: 'Impostazioni',
    nl: 'Instellingen',
    no: 'Innstillinger',
    pl: 'Ustawienia',
    se: 'Inställningar',
    status: 'NEW',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
];

// GET /api/v1/projects/:projectId/entries - List entries
router.get('/:projectId/entries', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { page = '1', limit = '50', search = '', filter = '' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  let entries = [...mockEntries];

  // Filter by project ID
  entries = entries.filter((e: any) => e.projectId === projectId);

  // Search by UUID or text
  if (search) {
    const searchLower = search.toString().toLowerCase();
    entries = entries.filter(
      (e: any) =>
        e.uuid.toLowerCase().includes(searchLower) ||
        e.cn?.toLowerCase().includes(searchLower) ||
        e.en?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status
  if (filter) {
    entries = entries.filter((e: any) => e.status === filter);
  }

  // Pagination
  const total = entries.length;
  const paginatedEntries = entries.slice(offset, offset + limitNum);

  return sendResponse(
    res,
    successResponse({
      entries: paginatedEntries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  );
});

// GET /api/v1/projects/:projectId/entries/:uuid - Get entry by UUID
router.get('/:projectId/entries/:uuid', (req: Request, res: Response) => {
  const { projectId, uuid } = req.params;
  const entry = mockEntries.find((e: any) => e.uuid === uuid && e.projectId === projectId);

  if (!entry) {
    return sendResponse(res, notFoundResponse('Entry', uuid), 404);
  }

  return sendResponse(res, successResponse(entry));
});

// POST /api/v1/projects/:projectId/entries - Create entry
router.post('/:projectId/entries', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { cn, en, de, es, fi, fr, it, nl, no, pl, se, da } = req.body;

  // Validation - at least one translation is required
  const hasTranslation = cn || en || de || es || fi || fr || it || nl || no || pl || se || da;
  if (!hasTranslation) {
    return sendResponse(
      res,
      validationErrorResponse({ translations: 'At least one translation is required' }),
      400
    );
  }

  // Auto-generate UUID for new entry
  const uuid = crypto.randomUUID();

  const newEntry = {
    uuid,
    projectId,
    cn: cn || null,
    en: en || null,
    de: de || null,
    es: es || null,
    fi: fi || null,
    fr: fr || null,
    it: it || null,
    nl: nl || null,
    no: no || null,
    pl: pl || null,
    se: se || null,
    da: da || null,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockEntries.unshift(newEntry);

  return sendResponse(res, successResponse(newEntry), 201);
});

// PUT /api/v1/projects/:projectId/entries/:uuid - Update entry
router.put('/:projectId/entries/:uuid', (req: Request, res: Response) => {
  const { projectId, uuid } = req.params;
  const entry = mockEntries.find((e: any) => e.uuid === uuid && e.projectId === projectId);

  if (!entry) {
    return sendResponse(res, notFoundResponse('Entry', uuid), 404);
  }

  const updates = req.body;

  const updatedEntry = {
    ...entry,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return sendResponse(res, successResponse(updatedEntry));
});

// DELETE /api/v1/projects/:projectId/entries/:uuid - Delete entry
router.delete('/:projectId/entries/:uuid', (req: Request, res: Response) => {
  const { projectId, uuid } = req.params;
  const entryIndex = mockEntries.findIndex(
    (e: any) => e.uuid === uuid && e.projectId === projectId
  );

  if (entryIndex === -1) {
    return sendResponse(res, notFoundResponse('Entry', uuid), 404);
  }

  mockEntries.splice(entryIndex, 1);

  return sendResponse(res, { id: uuid, message: 'Entry deleted successfully' }, 204);
});

// POST /api/v1/projects/:projectId/entries/bulk - Bulk update entries
router.post('/:projectId/entries/bulk', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { uuids, updates } = req.body;

  // Validation
  if (!Array.isArray(uuids) || uuids.length === 0) {
    return sendResponse(res, validationErrorResponse({ uuids: 'UUIDs array is required' }), 400);
  }

  if (!updates) {
    return sendResponse(
      res,
      validationErrorResponse({ updates: 'Updates object is required' }),
      400
    );
  }

  const updatedCount = uuids.filter((uuid) => {
    const entry = mockEntries.find((e: any) => e.uuid === uuid && e.projectId === projectId);
    if (entry) {
      Object.assign(entry, updates);
    }
  }).length;

  return sendResponse(res, {
    message: `Successfully updated ${updatedCount} entries`,
    data: { updatedCount, uuids },
  });
});

// POST /api/v1/projects/:projectId/entries/bulk-delete - Bulk delete entries
router.post('/:projectId/entries/bulk-delete', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { uuids } = req.body;

  // Validation
  if (!Array.isArray(uuids) || uuids.length === 0) {
    return sendResponse(res, validationErrorResponse({ uuids: 'UUIDs array is required' }), 400);
  }

  const deletedCount = uuids.filter((uuid) => {
    const entryIndex = mockEntries.findIndex(
      (e: any) => e.uuid === uuid && e.projectId === projectId
    );
    if (entryIndex !== -1) {
      mockEntries.splice(entryIndex, 1);
      return true;
    }
    return false;
  }).length;

  return sendResponse(res, {
    message: `Successfully deleted ${deletedCount} entries`,
    data: { deletedCount, uuids },
  });
});

export { uploadExcelHandler } from './entryUpload';

export default router;
