const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class EncryptionUtil {
  static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  static ALGORITHM = 'aes-256-cbc';

  /**
   * Hash sensitive string data (for names, mobile numbers)
   */
  static hashSensitiveData(data) {
    return bcrypt.hashSync(data, 10);
  }

  /**
   * Encrypt sensitive data (for DOB)
   */
  static encryptSensitiveData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY);
    let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Verify hashed data
   */
  static verifyHashedData(plainText, hashedData) {
    return bcrypt.compareSync(plainText, hashedData);
  }

  /**
   * Mask data for display (show only partial information)
   */
  static maskForDisplay(data, type = 'default') {
    if (!data) return '';
    
    switch (type) {
      case 'mobile':
        return data.length >= 4 ? `****${data.slice(-4)}` : '****';
      case 'name':
        return data.length > 2 ? `${data[0]}${'*'.repeat(data.length - 2)}${data[data.length - 1]}` : '**';
      case 'email':
        const [username, domain] = data.split('@');
        if (username && domain) {
          const maskedUsername = username.length > 2 
            ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
            : '**';
          return `${maskedUsername}@${domain}`;
        }
        return '****@****.com';
      default:
        return '*'.repeat(Math.min(data.length, 8));
    }
  }

  /**
   * Generate secure token for password reset, etc.
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = EncryptionUtil;
