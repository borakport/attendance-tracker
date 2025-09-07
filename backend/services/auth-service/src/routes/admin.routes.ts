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

// Create new user
// POST /admin/users
router.post('/users', AdminController.createUser);

// Update user
// PUT /admin/users/:id
router.put('/users/:id', AdminController.updateUser);

// Delete user
// DELETE /admin/users/:id
router.delete('/users/:id', AdminController.deleteUser);

export default router;
