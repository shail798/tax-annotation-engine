import express from 'express';
import formsRouter from './forms';

export const apiRoutes = express.Router();

// API version and status
apiRoutes.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tax Form Annotation System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Forms routes
apiRoutes.use('/forms', formsRouter);

export default apiRoutes; 