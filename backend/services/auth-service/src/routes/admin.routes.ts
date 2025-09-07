/**
 * Admin Routes for Authentication Service
 * 
 * Admin-only routes for user management and system administration.
 * All routes require ADMIN role authentication.
 */

import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// =====================================
// USER MANAGEMENT ROUTES
// =====================================

// Get all users with pagination and filtering
// GET /admin/users?page=1&limit=10&role=STUDENT&search=john
router.get('/users', AdminController.getAllUsers);

// Get user statistics
// GET /admin/users/stats
router.get('/users/stats', AdminController.getUserStats);

// Export users data
// GET /admin/users/export?format=csv&role=STUDENT
router.get('/users/export', AdminController.exportUsers);

// Get user by ID
// GET /admin/users/:id
router.get('/users/:id', AdminController.getUserById);

// Get user activity details
// GET /admin/users/:id/activity
router.get('/users/:id/activity', AdminController.getUserActivity);

// Create new user
// POST /admin/users
router.post('/users', AdminController.createUser);

// Reset user password
// POST /admin/users/:id/reset-password
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

// Toggle user account lock
// POST /admin/users/:id/toggle-lock
router.post('/users/:id/toggle-lock', AdminController.toggleUserLock);

// Update user
// PUT /admin/users/:id
router.put('/users/:id', AdminController.updateUser);

// Bulk update users
// PATCH /admin/users/bulk
router.patch('/users/bulk', AdminController.bulkUpdateUsers);

// Delete user
// DELETE /admin/users/:id
router.delete('/users/:id', AdminController.deleteUser);

// =====================================
// SYSTEM MANAGEMENT ROUTES
// =====================================

// Get available roles and permissions
// GET /admin/roles
router.get('/roles', AdminController.getRoles);

export default router;
