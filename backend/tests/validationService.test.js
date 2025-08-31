const ValidationService = require('../services/validationService');

describe('ValidationService', () => {
  
  describe('calculateAge', () => {
    test('should calculate correct age for a given date of birth', () => {
      const dob = new Date('1990-01-01');
      const age = ValidationService.calculateAge(dob);
      const expectedAge = new Date().getFullYear() - 1990;
      expect(age).toBe(expectedAge);
    });

    test('should handle birthday not yet occurred this year', () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dob = new Date(nextMonth.getFullYear() - 30, nextMonth.getMonth(), nextMonth.getDate());
      const age = ValidationService.calculateAge(dob);
      expect(age).toBe(29); // Birthday hasn't occurred yet
    });
  });

  describe('validatePolicyInputs', () => {
    const validData = {
      dob: new Date('1990-01-01'),
      gender: 'M',
      sum_assured: 1200000,
      modal_premium: 80000,
      premium_frequency: 'Yearly',
      policy_term: 18,
      premium_paying_term: 10
    };

    test('should pass validation for valid data', () => {
      const result = ValidationService.validatePolicyInputs(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when PPT is out of range (< 5)', () => {
      const invalidData = { ...validData, premium_paying_term: 3 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Premium paying term (PPT) must be minimum 5'))).toBe(true);
    });

    test('should fail when PPT is out of range (> 10)', () => {
      const invalidData = { ...validData, premium_paying_term: 12 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Premium paying term (PPT) must be maximum 10'))).toBe(true);
    });

    test('should fail when PT is out of range (< 10)', () => {
      const invalidData = { ...validData, policy_term: 8 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Policy term (PT) must be minimum 10'))).toBe(true);
    });

    test('should fail when PT is out of range (> 20)', () => {
      const invalidData = { ...validData, policy_term: 25 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Policy term (PT) must be maximum 20'))).toBe(true);
    });

    test('should fail when premium is out of range (< 10000)', () => {
      const invalidData = { ...validData, modal_premium: 5000 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Premium must be minimum 10000'))).toBe(true);
    });

    test('should fail when premium is out of range (> 100000)', () => {
      const invalidData = { ...validData, modal_premium: 110000 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Premium must be maximum 100000'))).toBe(true);
    });

    test('should fail when PT <= PPT', () => {
      const invalidData = { ...validData, policy_term: 10, premium_paying_term: 10 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Policy Term (PT) must be greater than Premium Paying Term (PPT)'))).toBe(true);
    });

    test('should fail when age is below 23', () => {
      const youngDob = new Date();
      youngDob.setFullYear(youngDob.getFullYear() - 20); // 20 years old
      const invalidData = { ...validData, dob: youngDob };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Age must be minimum 23'))).toBe(true);
    });

    test('should fail when age is above 56', () => {
      const oldDob = new Date();
      oldDob.setFullYear(oldDob.getFullYear() - 60); // 60 years old
      const invalidData = { ...validData, dob: oldDob };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Age must be maximum 56'))).toBe(true);
    });

    test('should fail when sum assured is less than 10 times premium', () => {
      const invalidData = { ...validData, modal_premium: 50000, sum_assured: 400000 };
      const result = ValidationService.validatePolicyInputs(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Sum assured must be minimum of 500000'))).toBe(true);
    });
  });

  describe('validateUserRegistration', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
      mobile: '9876543210',
      dob: new Date('1990-01-01'),
      gender: 'M'
    };

    test('should pass validation for valid user data', () => {
      const result = ValidationService.validateUserRegistration(validUserData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail for invalid email', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      const result = ValidationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('valid email'))).toBe(true);
    });

    test('should fail for invalid mobile number', () => {
      const invalidData = { ...validUserData, mobile: '123' };
      const result = ValidationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Mobile number must be 10 digits'))).toBe(true);
    });

    test('should fail for user under 18', () => {
      const youngDob = new Date();
      youngDob.setFullYear(youngDob.getFullYear() - 16);
      const invalidData = { ...validUserData, dob: youngDob };
      const result = ValidationService.validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('User must be at least 18 years old'))).toBe(true);
    });
  });
});
