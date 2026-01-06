const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, getAllUsers, assignRole, getUsersByRole, toggleUserStatus } = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/all', auth, getAllUsers);

// Admin only routes
router.post('/assign-role', auth, authorize('admin'), assignRole);
router.get('/by-role/:role', auth, authorize('admin', 'manager'), getUsersByRole);
router.put('/toggle-status', auth, authorize('admin'), toggleUserStatus);

module.exports = router;
