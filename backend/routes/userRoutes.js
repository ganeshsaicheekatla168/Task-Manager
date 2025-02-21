import express from 'express';
import { addUser,checkEmailExistence,login ,getAllUsersNameAndID , ForgotPassword , resetPassword} from '../controllers/userController.js'; // Adjust path as necessary
import jwt from 'jsonwebtoken';
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({ error: 'No token provided' });
    }
  
    // Remove 'Bearer ' from the token (because it's usually in the format 'Bearer <token>')
    const tokenWithoutBearer = token.split(' ')[1];
    console.log(tokenWithoutBearer);
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      console.log("jwt Token verified"+tokenWithoutBearer);
      next();  // Proceed to the next middleware or route handler
    });
  };
  

router.post('/add', addUser);
// Route for checking if an email exists
router.get('/check-email',verifyToken,checkEmailExistence);

router.post('/login',login);

router.get('/getNamesAndIDs',verifyToken,getAllUsersNameAndID );

router.post('/forgot-password' , ForgotPassword);
router.post('/reset-password' , resetPassword);

export default router;
