import { Router, Request, Response } from 'express';
import {
  successResponse,
  notFoundResponse,
  sendResponse,
  validationErrorResponse,
  errorResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';
import { optionalAuthenticate } from '../middleware/auth';
import upload, { handleFileUploadError, validateFileUpload } from '../middleware/fileUpload';
import { parseExcelFile } from '../utils/excelParser';
import { entryService } from '../services/EntryService';
import { randomUUID } from 'crypto';

const router = Router();

// GET /api/v1/projects/:projectId/entries - List entries
router.get('/:projectId/entries', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { page = '1', limit = '50', search = '', filter = '', status } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const result = await entryService.getEntries(projectId, {
      status: (status as any) || (filter as any) || undefined,
      search: (search as string) || undefined,
      skip,
      take: limitNum,
    });

    return sendResponse(
      res,
      successResponse({
        entries: result.entries,
        pagination: {
          page: result.currentPage,
          limit: limitNum,
          total: result.total,
          totalPages: result.pages,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching entries:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch entries',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

// GET /api/v1/projects/:projectId/entries/:uuid - Get entry by UUID
router.get('/:projectId/entries/:uuid', async (req: Request, res: Response) => {
  try {
    const { projectId, uuid } = req.params;

    const entry = await entryService.getEntryByUUID(projectId, uuid);

    if (!entry) {
      return sendResponse(res, notFoundResponse('Entry', uuid), 404);
    }

    return sendResponse(res, successResponse(entry));
  } catch (error) {
    console.error('Error fetching entry:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch entry',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

// POST /api/v1/projects/:projectId/entries - Create entry
router.post('/:projectId/entries', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { key, cn, en, de, es, fi, fr, it, nl, no, pl, se, da } = req.body;

    // Validation - at least one translation is required
    const hasTranslation = cn || en || de || es || fi || fr || it || nl || no || pl || se || da;
    if (!hasTranslation) {
      return sendResponse(
        res,
        validationErrorResponse({ translations: ['At least one translation is required'] }),
        400
      );
    }

    // Generate key if not provided
    const entryKey = key || randomUUID();

    const newEntry = await entryService.createEntry({
      projectId,
      key: entryKey,
      translations: {
        cn: cn || undefined,
        en: en || undefined,
        de: de || undefined,
        es: es || undefined,
        fi: fi || undefined,
        fr: fr || undefined,
        it: it || undefined,
        nl: nl || undefined,
        no: no || undefined,
        pl: pl || undefined,
        se: se || undefined,
        da: da || undefined,
      },
    });

    return sendResponse(res, successResponse(newEntry), 201);
  } catch (error) {
    console.error('Error creating entry:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to create entry',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

// PUT /api/v1/projects/:projectId/entries/:uuid - Update entry
router.put('/:projectId/entries/:uuid', async (req: Request, res: Response) => {
  try {
    const { projectId, uuid } = req.params;
    const { key, cn, en, de, es, fi, fr, it, nl, no, pl, se, da, status } = req.body;

    const updatedEntry = await entryService.updateEntry(projectId, uuid, {
      key: key || undefined,
      translations: {
        cn: cn !== undefined ? cn : undefined,
        en: en !== undefined ? en : undefined,
        de: de !== undefined ? de : undefined,
        es: es !== undefined ? es : undefined,
        fi: fi !== undefined ? fi : undefined,
        fr: fr !== undefined ? fr : undefined,
        it: it !== undefined ? it : undefined,
        nl: nl !== undefined ? nl : undefined,
        no: no !== undefined ? no : undefined,
        pl: pl !== undefined ? pl : undefined,
        se: se !== undefined ? se : undefined,
        da: da !== undefined ? da : undefined,
      },
      status: status || undefined,
    });

    if (!updatedEntry) {
      return sendResponse(res, notFoundResponse('Entry', uuid), 404);
    }

    return sendResponse(res, successResponse(updatedEntry));
  } catch (error) {
    console.error('Error updating entry:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to update entry',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

// DELETE /api/v1/projects/:projectId/entries/:uuid - Delete entry
router.delete('/:projectId/entries/:uuid', async (req: Request, res: Response) => {
  try {
    const { projectId, uuid } = req.params;

    await entryService.deleteEntry(projectId, uuid);

    return sendResponse(res, successResponse({ message: 'Entry deleted successfully' }));
  } catch (error) {
    console.error('Error deleting entry:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to delete entry',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

// POST /api/v1/projects/:projectId/entries/upload - Upload Excel file
router.post(
  '/:projectId/entries/upload',
  optionalAuthenticate,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;

      if (!req.file) {
        return sendResponse(
          res,
          errorResponse('No file uploaded', ErrorCode.VALIDATION_ERROR),
          400
        );
      }

      // Parse Excel file
      const result = parseExcelFile(req.file.buffer, projectId);

      if (!result.success) {
        return sendResponse(
          res,
          errorResponse(result.error || 'Failed to parse Excel file', ErrorCode.FILE_PARSE_ERROR),
          400
        );
      }

      // Import entries to database
      const importResult = await entryService.importEntries(
        projectId,
        result.data!.entries.map((entry) => ({
          projectId: entry.projectId,
          key: entry.key,
          translations: {
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
          },
        }))
      );

      return sendResponse(
        res,
        successResponse({
          entries: importResult.entries,
          errors: result.data!.errors,
          rowCount: result.data!.rowCount,
          importedCount: importResult.count,
          errorCount: result.data!.errors.length,
          message: importResult.message,
        })
      );
    } catch (error) {
      console.error('Error uploading entries:', error);
      return sendResponse(
        res,
        errorResponse(
          error instanceof Error ? error.message : 'Failed to upload entries',
          ErrorCode.INTERNAL_ERROR
        ),
        500
      );
    }
  }
);

// GET /api/v1/projects/:projectId/entries/stats - Get entry statistics
router.get('/:projectId/entries/stats', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const stats = await entryService.getEntryStats(projectId);
    return sendResponse(res, successResponse(stats));
  } catch (error) {
    console.error('Error fetching entry stats:', error);
    return sendResponse(
      res,
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch entry stats',
        ErrorCode.INTERNAL_ERROR
      ),
      500
    );
  }
});

export default router;
