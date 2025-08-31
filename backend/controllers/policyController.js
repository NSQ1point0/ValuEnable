const { Policy, Illustration, User } = require('../models');
const ValidationService = require('../services/validationService');
const CalculationService = require('../services/calculationService');
const EncryptionUtil = require('../utils/encryption');

class PolicyController {

  /**
   * Create new policy calculation
   */
  static async createPolicy(req, res) {
    try {
      const userId = req.user.id;
      
      // Get user's DOB for age calculation
      const user = await User.findByPk(userId);
      const dob = EncryptionUtil.decryptSensitiveData(user.dob_encrypted);
      
      const policyData = {
        ...req.body,
        dob
      };

      // Validate policy inputs
      const validation = ValidationService.validatePolicyInputs(policyData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Create policy record
      const policy = await Policy.create({
        user_id: userId,
        sum_assured: req.body.sum_assured,
        modal_premium: req.body.modal_premium,
        premium_frequency: req.body.premium_frequency,
        policy_term: req.body.policy_term,
        premium_paying_term: req.body.premium_paying_term,
        calculated_age: validation.age,
        annual_premium: CalculationService.calculateAnnualPremium(req.body.modal_premium, req.body.premium_frequency)
      });

      // Calculate benefit illustration
      const calculationData = {
        sum_assured: policy.sum_assured,
        modal_premium: policy.modal_premium,
        premium_frequency: policy.premium_frequency,
        policy_term: policy.policy_term,
        premium_paying_term: policy.premium_paying_term,
        calculated_age: policy.calculated_age
      };

      const illustration = CalculationService.calculateBenefitIllustration(calculationData);

      // Save illustration data
      const illustrationRecords = illustration.illustrations.map(illus => ({
        policy_id: policy.id,
        ...illus
      }));

      await Illustration.bulkCreate(illustrationRecords);

      res.status(201).json({
        message: 'Policy created and calculated successfully',
        policy: {
          id: policy.id,
          sum_assured: policy.sum_assured,
          modal_premium: policy.modal_premium,
          premium_frequency: policy.premium_frequency,
          policy_term: policy.policy_term,
          premium_paying_term: policy.premium_paying_term,
          calculated_age: policy.calculated_age,
          annual_premium: policy.annual_premium
        },
        calculation: illustration
      });

    } catch (error) {
      console.error('Policy creation error:', error);
      res.status(500).json({ error: 'Failed to create policy', message: error.message });
    }
  }

  /**
   * Get user's policies
   */
  static async getUserPolicies(req, res) {
    try {
      const userId = req.user.id;
      
      const policies = await Policy.findAll({
        where: { user_id: userId },
        include: [{
          model: Illustration,
          as: 'illustrations',
          attributes: ['year', 'age', 'premium_paid', 'cumulative_premium', 'total_benefit', 'surrender_value', 'death_benefit']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        policies: policies.map(policy => ({
          id: policy.id,
          sum_assured: policy.sum_assured,
          modal_premium: policy.modal_premium,
          premium_frequency: policy.premium_frequency,
          policy_term: policy.policy_term,
          premium_paying_term: policy.premium_paying_term,
          calculated_age: policy.calculated_age,
          annual_premium: policy.annual_premium,
          policy_status: policy.policy_status,
          calculation_date: policy.calculation_date,
          illustrations_count: policy.illustrations.length
        }))
      });

    } catch (error) {
      console.error('Fetch policies error:', error);
      res.status(500).json({ error: 'Failed to fetch policies' });
    }
  }

  /**
   * Get specific policy with full illustration
   */
  static async getPolicyDetails(req, res) {
    try {
      const { policyId } = req.params;
      const userId = req.user.id;

      const policy = await Policy.findOne({
        where: { id: policyId, user_id: userId },
        include: [{
          model: Illustration,
          as: 'illustrations',
          order: [['year', 'ASC']]
        }]
      });

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Calculate summary details
      const maturityDetails = CalculationService.calculateMaturityDetails({
        sum_assured: policy.sum_assured,
        modal_premium: policy.modal_premium,
        premium_frequency: policy.premium_frequency,
        policy_term: policy.policy_term,
        premium_paying_term: policy.premium_paying_term,
        calculated_age: policy.calculated_age
      });

      res.json({
        policy: {
          id: policy.id,
          sum_assured: policy.sum_assured,
          modal_premium: policy.modal_premium,
          premium_frequency: policy.premium_frequency,
          policy_term: policy.policy_term,
          premium_paying_term: policy.premium_paying_term,
          calculated_age: policy.calculated_age,
          annual_premium: policy.annual_premium,
          policy_status: policy.policy_status,
          calculation_date: policy.calculation_date
        },
        illustrations: policy.illustrations,
        maturity_details: maturityDetails
      });

    } catch (error) {
      console.error('Policy details error:', error);
      res.status(500).json({ error: 'Failed to fetch policy details' });
    }
  }

  /**
   * Recalculate policy (for updated parameters)
   */
  static async recalculatePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const userId = req.user.id;

      const policy = await Policy.findOne({
        where: { id: policyId, user_id: userId }
      });

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Get user's DOB for age calculation
      const user = await User.findByPk(userId);
      const dob = EncryptionUtil.decryptSensitiveData(user.dob_encrypted);
      
      const policyData = {
        ...req.body,
        dob
      };

      // Validate updated inputs
      const validation = ValidationService.validatePolicyInputs(policyData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Update policy
      await policy.update({
        sum_assured: req.body.sum_assured,
        modal_premium: req.body.modal_premium,
        premium_frequency: req.body.premium_frequency,
        policy_term: req.body.policy_term,
        premium_paying_term: req.body.premium_paying_term,
        calculated_age: validation.age,
        annual_premium: CalculationService.calculateAnnualPremium(req.body.modal_premium, req.body.premium_frequency),
        calculation_date: new Date()
      });

      // Delete old illustrations
      await Illustration.destroy({ where: { policy_id: policyId } });

      // Recalculate illustration
      const calculationData = {
        sum_assured: policy.sum_assured,
        modal_premium: policy.modal_premium,
        premium_frequency: policy.premium_frequency,
        policy_term: policy.policy_term,
        premium_paying_term: policy.premium_paying_term,
        calculated_age: policy.calculated_age
      };

      const illustration = CalculationService.calculateBenefitIllustration(calculationData);

      // Save new illustration data
      const illustrationRecords = illustration.illustrations.map(illus => ({
        policy_id: policy.id,
        ...illus
      }));

      await Illustration.bulkCreate(illustrationRecords);

      res.json({
        message: 'Policy recalculated successfully',
        policy: {
          id: policy.id,
          sum_assured: policy.sum_assured,
          modal_premium: policy.modal_premium,
          premium_frequency: policy.premium_frequency,
          policy_term: policy.policy_term,
          premium_paying_term: policy.premium_paying_term,
          calculated_age: policy.calculated_age,
          annual_premium: policy.annual_premium
        },
        calculation: illustration
      });

    } catch (error) {
      console.error('Policy recalculation error:', error);
      res.status(500).json({ error: 'Failed to recalculate policy', message: error.message });
    }
  }

  /**
   * Delete policy
   */
  static async deletePolicy(req, res) {
    try {
      const { policyId } = req.params;
      const userId = req.user.id;

      const policy = await Policy.findOne({
        where: { id: policyId, user_id: userId }
      });

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Delete illustrations first (foreign key constraint)
      await Illustration.destroy({ where: { policy_id: policyId } });
      
      // Delete policy
      await policy.destroy();

      res.json({ message: 'Policy deleted successfully' });

    } catch (error) {
      console.error('Policy deletion error:', error);
      res.status(500).json({ error: 'Failed to delete policy' });
    }
  }
}

module.exports = PolicyController;
