import { Router } from 'express';
import * as userController from '../controllers/User.controller.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.post('/signup', userController.signUp); // Registro de usuario
router.post('/login', userController.login); // Inicio de sesión y entrega de token
router.get('/verify/:token', userController.verifyAccount); // Verificar cuenta por token
router.post('/send-reset-email', userController.sendPasswordResetLink);
router.post('/reset-password/:token', userController.resetPassword); // Restablecer la contraseña

// Nuevas rutas para preguntas secretas
router.get('/get-secret-question/:email', userController.getSecretQuestion);
router.post('/get-secret-question', userController.getSecretQuestion);
router.post('/verify-secret-answer', userController.verifySecretQuestion); // Verificar respuesta secreta

// Rutas protegidas (requieren token de autenticación)
router.get('/profile', isAuthenticated, userController.getProfile); // Perfil del usuario 
router.put('/update-profile', isAuthenticated, userController.updateProfile); // Actualizar perfil
router.get('/check-session', isAuthenticated, userController.checkSession); // Verificar la sesión
router.post('/logout', isAuthenticated, userController.logout); // Cerrar sesión

// Rutas de administrador (requieren token y rol de admin)
router.get('/users', isAuthenticated, isAdmin, userController.getAllUsers);
router.get('/admin/recent-users', isAuthenticated, isAdmin, userController.getRecentUsers);
router.get('/admin/recent-blocked', isAuthenticated, isAdmin, userController.getRecentBlockedUsers);
router.get('/admin/failed-login-attempts', isAuthenticated, isAdmin, userController.getFailedLoginAttempts);
router.post('/admin/block-user', isAuthenticated, isAdmin, userController.blockUser);
router.post('/admin/block-user-temporarily', isAuthenticated, isAdmin, userController.blockUserTemporarily);
router.post('/admin/unblock-user', isAuthenticated, isAdmin, userController.unblockUser);
router.get('/admin/recent-logins', isAuthenticated, isAdmin, userController.getRecentLogins);
router.delete('/admin/users/:id', isAuthenticated, isAdmin, userController.deleteUser);
router.put('/admin/users/:id', isAuthenticated, isAdmin, userController.adminUpdateUser);

export default router;