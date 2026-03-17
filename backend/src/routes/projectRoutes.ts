import { Router, Request, Response } from 'express';
import { projectService } from '../services';
import {
  successResponse,
  notFoundResponse,
  sendResponse,
  validationErrorResponse,
  errorResponse,
} from '../utils/response';
import { ErrorCode } from '../types/api';

const router = Router();

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects
 * @access  Private (JWT or API Key)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const result = await projectService.getProjects({
      status: status as any,
      search: search as string,
      skip,
      take: limitNum,
    });

    return res.json(successResponse(result));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res
      .status(500)
      .json(
        errorResponse('Failed to fetch projects', ErrorCode.INTERNAL_ERROR, undefined, undefined)
      );
  }
});

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get a single project by ID
 * @access  Private (JWT or API Key)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const project = await projectService.getProjectById(id);

    return res.json(successResponse(project));
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return res.status(404).json(notFoundResponse('Project', id));
    }
    console.error('Error fetching project:', error);
    return res.status(500).json(errorResponse('Failed to fetch project', ErrorCode.INTERNAL_ERROR));
  }
});

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private (JWT or API Key)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, languages } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json(
        validationErrorResponse({
          name: ['Project name is required'],
        })
      );
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json(
        validationErrorResponse({
          description: ['Project description is required'],
        })
      );
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json(
        validationErrorResponse({
          languages: ['At least one language is required'],
        })
      );
    }

    const project = await projectService.createProject({
      name: name.trim(),
      description: description.trim(),
      languages,
    });

    return res.status(201).json(successResponse(project, 'Project created successfully'));
  } catch (error) {
    console.error('Error creating project:', error);
    return res
      .status(500)
      .json(errorResponse('Failed to create project', ErrorCode.INTERNAL_ERROR));
  }
});

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update a project
 * @access  Private (JWT or API Key)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, languages } = req.body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (languages !== undefined) updateData.languages = languages;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(
        validationErrorResponse({
          body: ['No valid fields to update'],
        })
      );
    }

    const project = await projectService.updateProject(id, updateData);

    return res.json(successResponse(project, 'Project updated successfully'));
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return res.status(404).json(notFoundResponse('Project', id));
    }
    console.error('Error updating project:', error);
    return res
      .status(500)
      .json(errorResponse('Failed to update project', ErrorCode.INTERNAL_ERROR));
  }
});

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete a project (soft delete)
 * @access  Private (JWT or API Key)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await projectService.deleteProject(id);

    return res.json(successResponse(null, 'Project deleted successfully'));
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return res.status(404).json(notFoundResponse('Project', id));
    }
    console.error('Error deleting project:', error);
    return res
      .status(500)
      .json(errorResponse('Failed to delete project', ErrorCode.INTERNAL_ERROR));
  }
});

/**
 * @route   GET /api/v1/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private (JWT or API Key)
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const stats = await projectService.getProjectStats(id);

    return res.json(successResponse(stats));
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return res.status(404).json(notFoundResponse('Project', id));
    }
    console.error('Error fetching project stats:', error);
    return res
      .status(500)
      .json(
        errorResponse(
          'Failed to fetch project statistics',
          ErrorCode.INTERNAL_ERROR,
          undefined,
          undefined
        )
      );
  }
});

export default router;
