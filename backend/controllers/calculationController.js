const CalculationService = require('../services/calculationService');
const ValidationService = require('../services/validationService');

class CalculationController {

  /**
   * Calculate benefit illustration without saving to database
   */
  static async calculateIllustration(req, res) {
    try {
      const policyData = req.body;

      // Validate inputs
      const validation = ValidationService.validatePolicyInputs(policyData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Add calculated age to policy data
      const calculationData = {
        ...policyData,
        calculated_age: validation.age
      };

      // Calculate illustration
      const illustration = CalculationService.calculateBenefitIllustration(calculationData);
      const maturityDetails = CalculationService.calculateMaturityDetails(calculationData);

      res.json({
        message: 'Illustration calculated successfully',
        inputs: {
          sum_assured: policyData.sum_assured,
          modal_premium: policyData.modal_premium,
          premium_frequency: policyData.premium_frequency,
          policy_term: policyData.policy_term,
          premium_paying_term: policyData.premium_paying_term,
          calculated_age: validation.age
        },
        calculation: illustration,
        maturity_details: maturityDetails
      });

    } catch (error) {
      console.error('Calculation error:', error);
      res.status(500).json({ error: 'Calculation failed', message: error.message });
    }
  }

  /**
   * Bulk calculation endpoint for scalability
   */
  static async bulkCalculation(req, res) {
    try {
      const { policies } = req.body;

      if (!policies || !Array.isArray(policies)) {
        return res.status(400).json({ error: 'Policies array is required' });
      }

      if (policies.length === 0) {
        return res.status(400).json({ error: 'At least one policy is required' });
      }

      // Limit batch size for API calls
      const maxBatchSize = 10000;
      if (policies.length > maxBatchSize) {
        return res.status(400).json({ 
          error: `Batch size too large. Maximum allowed: ${maxBatchSize}` 
        });
      }

      // Process policies in batches
      const results = await CalculationService.calculateBulkIllustrations(policies, 1000);

      // Separate successful and failed calculations
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.json({
        message: 'Bulk calculation completed',
        summary: {
          total_processed: policies.length,
          successful_count: successful.length,
          failed_count: failed.length,
          success_rate: ((successful.length / policies.length) * 100).toFixed(2) + '%'
        },
        results: {
          successful: successful.map(r => ({
            policy_id: r.policy_id,
            annual_premium: r.data.annual_premium,
            maturity_benefit: r.data.summary.maturity_benefit,
            total_premiums_paid: r.data.summary.total_premiums_paid
          })),
          failed: failed.map(r => ({
            policy_id: r.policy_id,
            errors: r.errors
          }))
        }
      });

    } catch (error) {
      console.error('Bulk calculation error:', error);
      res.status(500).json({ error: 'Bulk calculation failed', message: error.message });
    }
  }

  /**
   * Get calculation parameters and validation rules
   */
  static async getCalculationRules(req, res) {
    try {
      res.json({
        validation_rules: {
          premium_paying_term: { min: 5, max: 10 },
          policy_term: { min: 10, max: 20 },
          modal_premium: { min: 10000, max: 100000 },
          age: { min: 23, max: 56 },
          custom_rules: [
            'Policy Term (PT) must be greater than Premium Paying Term (PPT)',
            'Sum assured must be minimum of 10 times premium or 500000, whichever is higher'
          ]
        },
        premium_frequencies: ['Yearly', 'Half-Yearly', 'Monthly'],
        gender_options: ['M', 'F', 'Other'],
        calculation_methodology: {
          annual_premium: 'Modal Premium × Frequency Multiplier',
          guaranteed_addition: '5% of Sum Assured annually during premium paying term',
          total_benefit: 'Sum Assured + Cumulative Guaranteed Additions',
          surrender_value: '80% of cumulative premiums paid (available after 3 years)',
          death_benefit: 'Higher of Sum Assured or Total Benefit'
        }
      });
    } catch (error) {
      console.error('Rules fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch calculation rules' });
    }
  }

  /**
   * Validate policy inputs endpoint
   */
  static async validateInputs(req, res) {
    try {
      const validation = ValidationService.validatePolicyInputs(req.body);
      
      res.json({
        is_valid: validation.isValid,
        errors: validation.errors,
        calculated_age: validation.age,
        message: validation.isValid ? 'All validations passed' : 'Validation failed'
      });

    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Validation failed', message: error.message });
    }
  }
}

module.exports = CalculationController;
