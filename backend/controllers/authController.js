const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const ValidationService = require('../services/validationService');
const EncryptionUtil = require('../utils/encryption');

class AuthController {
  
  /**
   * Register new user with encrypted sensitive data
   */
  static async register(req, res) {
    try {
      const { email, password, name, mobile, dob, gender } = req.body;

      // Validate input data
      const validation = ValidationService.validateUserRegistration(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Encrypt/hash sensitive data
      const nameHash = EncryptionUtil.hashSensitiveData(name);
      const dobEncrypted = EncryptionUtil.encryptSensitiveData(dob);
      const mobileHash = EncryptionUtil.hashSensitiveData(mobile);

      // Create user
      const user = await User.create({
        email,
        password,
        name_hash: nameHash,
        dob_encrypted: dobEncrypted,
        mobile_hash: mobileHash,
        gender
      });

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          gender: user.gender,
          name: EncryptionUtil.maskForDisplay(name, 'name'),
          mobile: EncryptionUtil.maskForDisplay(mobile, 'mobile'),
          age: validation.age
        },
        token,
        refreshToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed', message: error.message });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validation = ValidationService.validateUserLogin(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Generate tokens
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Get decrypted DOB for age calculation
      let age = null;
      try {
        const dob = EncryptionUtil.decryptSensitiveData(user.dob_encrypted);
        age = ValidationService.calculateAge(dob);
      } catch (error) {
        console.error('Error decrypting DOB:', error);
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name_hash,
          email: user.email,
          gender: user.gender,
          age
        },
        token,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', message: error.message });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = req.user;
      
      // Get decrypted DOB for age calculation
      let age = null;
      try {
        const dob = EncryptionUtil.decryptSensitiveData(user.dob_encrypted);
        age = ValidationService.calculateAge(dob);
      } catch (error) {
        console.error('Error decrypting DOB:', error);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          gender: user.gender,
          age,
          // Return masked versions for display
          email_masked: EncryptionUtil.maskForDisplay(user.email, 'email')
        }
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  static async logout(req, res) {
    // In a production app, you'd maintain a blacklist of tokens
    // For simplicity, we'll just return success
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = AuthController;
