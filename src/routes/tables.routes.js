import { Router } from 'express';
import { tablesController } from '../controllers/tables.controllers.js';

const router = Router();

router.get('/', tablesController.listTables);
router.get('/:table', tablesController.getRows);
router.post('/:table', tablesController.createRow);
router.put('/:table/:id', tablesController.updateRow);
router.delete('/:table/:id', tablesController.deleteRow);

export default router;
