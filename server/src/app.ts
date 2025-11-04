import express from 'express';
import { facebookWebhook } from './controllers/webhookController';
import { getProductBySlugHandler } from './controllers/productController';
import { createOrderHandler } from './controllers/orderController';
import { adminLoginHandler, adminListOrdersHandler } from './controllers/adminController';
import { requireAdmin } from './middleware/auth';
import { adminCreateProductHandler, adminUpdateProductHandler, adminUpsertByFbHandler } from './controllers/adminProductController';
import { adminGetOrderHandler, adminUpdateOrderStatusHandler } from './controllers/orderAdminController';

const app = express();

app.use(express.json());

// health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// webhook
app.post('/webhook/facebook', facebookWebhook);

// public product endpoint
app.get('/o/:slug', getProductBySlugHandler);

// create order
app.post('/orders', createOrderHandler);

// admin auth & routes
app.post('/admin/login', adminLoginHandler);
app.get('/admin/orders', requireAdmin, adminListOrdersHandler);

// admin product management (JWT protected)
app.post('/admin/products', requireAdmin, adminCreateProductHandler);
app.put('/admin/products/:id', requireAdmin, adminUpdateProductHandler);
app.post('/admin/products/upsert-by-fb', requireAdmin, adminUpsertByFbHandler);

// admin order endpoints
app.get('/admin/orders/:id', requireAdmin, adminGetOrderHandler);
app.patch('/admin/orders/:id/status', requireAdmin, adminUpdateOrderStatusHandler);

export default app;