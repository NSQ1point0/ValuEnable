const Joi = require('joi');

class ValidationService {
  
  // Validation schemas based on spreadsheet requirements
  static policyInputSchema = Joi.object({
    dob: Joi.date().required().max('now').messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
    //gender: Joi.string().valid('M', 'F', 'Other').required(),
    sum_assured: Joi.number().min(500000).required().messages({
      'number.min': 'Sum assured must be minimum of 10 times sum assured or 500000'
    }),
    modal_premium: Joi.number().min(10000).max(100000).required().messages({
      'number.min': 'Premium must be minimum 10000',
      'number.max': 'Premium must be maximum 100000'
    }),
    premium_frequency: Joi.string().valid('Yearly', 'Half-Yearly', 'Monthly').required(),
    policy_term: Joi.number().integer().min(10).max(20).required().messages({
      'number.min': 'Policy term (PT) must be minimum 10',
      'number.max': 'Policy term (PT) must be maximum 20'
    }),
    premium_paying_term: Joi.number().integer().min(5).max(10).required().messages({
      'number.min': 'Premium paying term (PPT) must be minimum 5',
      'number.max': 'Premium paying term (PPT) must be maximum 10'
    })
  });

  /**
   * Validates policy input data according to the 5 validation rules from spreadsheet:
   * 1. PPT: Min 5, Max 10
   * 2. PT: Min 10, Max 20  
   * 3. Premium: Min 10000, Max 50000
   * 4. PT > PPT
   * 5. Age: Min 23, Max 56
   */
  static validatePolicyInputs(data) {
    const errors = [];

    // Basic schema validation
    const { error } = this.policyInputSchema.validate(data);
    if (error) {
      errors.push(...error.details.map(detail => detail.message));
    }

    // Custom validation 4: PT > PPT
    if (data.policy_term && data.premium_paying_term && data.policy_term <= data.premium_paying_term) {
      errors.push('Policy Term (PT) must be greater than Premium Paying Term (PPT)');
    }

    // Custom validation 5: Age calculation and limits
    if (data.dob) {
      const age = this.calculateAge(data.dob);
      if (age < 23) {
        errors.push('Age must be minimum 23');
      }
      if (age > 56) {
        errors.push('Age must be maximum 56');
      }
    }

    // Sum assured validation (minimum 10 times premium or 500000)
    if (data.modal_premium && data.sum_assured) {
      const minSumAssured = Math.max(data.modal_premium * 10, 500000);
      if (data.sum_assured < minSumAssured) {
        errors.push(`Sum assured must be minimum of ${minSumAssured} (10 times premium or 500000, whichever is higher)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      age: data.dob ? this.calculateAge(data.dob) : null
    };
  }

  /**
   * Calculate age based on date of birth (completed birthday logic)
   */
  static calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate authentication data
   */
  static userRegistrationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    name: Joi.string().min(2).max(100).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Mobile number must be 10 digits'
    }),
    dob: Joi.date().required().max('now'),
    gender: Joi.string().valid('M', 'F', 'Other').required()
  });

  static userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  static validateUserRegistration(data) {
    const { error } = this.userRegistrationSchema.validate(data);
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // Additional age validation for registration
    const age = this.calculateAge(data.dob);
    if (age < 18) {
      return {
        isValid: false,
        errors: ['User must be at least 18 years old']
      };
    }

    return { isValid: true, errors: [], age };
  }

  static validateUserLogin(data) {
    const { error } = this.userLoginSchema.validate(data);
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : []
    };
  }
}

module.exports = ValidationService;
