import express from 'express';
import { getLogger } from '@/utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');

/* GET users listing. */
router.get('/', function (_req, res, _next) {
  logger.info('respond with a resource');
  // res.send('respond with a resource');
  res.json({
    status: 'success',
    message: 'Good to use data for users route.',
  });
});

export default router;
