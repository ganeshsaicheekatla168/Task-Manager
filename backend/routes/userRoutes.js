import express from 'express';
import { getUsersBySearch, addUser, checkEmailExistence, login, getAllUsersNameAndID, ForgotPassword, resetPassword } from '../controllers/userController.js'; // Adjust path as necessary
import { verifyToken } from '../middlewares/verifyauthToken.js';
const router = express.Router();
 
router.post('/add', addUser);
router.get('/check-email', verifyToken, checkEmailExistence);
router.post('/login', login);
router.get('/getNamesAndIDs', verifyToken, getAllUsersNameAndID);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', resetPassword);
 
router.get("/getSearchUsers", verifyToken, getUsersBySearch);
 
export default router;