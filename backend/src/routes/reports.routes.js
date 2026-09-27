import { Router } from 'express';

import * as reportsController from '../controllers/reportsController.js';
import { uploadPhoto } from '../middleware/upload.js';

const router = Router();

router.get('/', reportsController.listReports);
router.post('/', uploadPhoto.single('photo'), reportsController.createReport);
router.get('/:publicId', reportsController.getReport);
router.get('/:publicId/photo', reportsController.getReportPhoto);
router.patch('/:publicId/action', reportsController.updateReportAction);

// Authority verification: grouping duplicates + dispatching maintenance.
router.get('/:publicId/candidates', reportsController.getCandidates);
router.get('/:publicId/group', reportsController.getGroupMembers);
router.patch('/:publicId/group', reportsController.setReportGroup);
router.patch('/:publicId/assign', reportsController.assignReport);

export default router;
