const CalculationService = require('../services/calculationService');

describe('CalculationService', () => {
  
  describe('calculateAnnualPremium', () => {
    test('should calculate annual premium for yearly frequency', () => {
      const result = CalculationService.calculateAnnualPremium(80000, 'Yearly');
      expect(result).toBe(80000);
    });

    test('should calculate annual premium for half-yearly frequency', () => {
      const result = CalculationService.calculateAnnualPremium(40000, 'Half-Yearly');
      expect(result).toBe(80000);
    });

    test('should calculate annual premium for monthly frequency', () => {
      const result = CalculationService.calculateAnnualPremium(6667, 'Monthly');
      expect(result).toBe(80004);
    });
  });

  describe('calculateBenefitIllustration', () => {
    const testPolicyData = {
      sum_assured: 1200000,
      modal_premium: 80000,
      premium_frequency: 'Yearly',
      policy_term: 18,
      premium_paying_term: 10,
      calculated_age: 30
    };

    test('should calculate correct illustration for valid policy data', () => {
      const result = CalculationService.calculateBenefitIllustration(testPolicyData);
      
      expect(result.annual_premium).toBe(80000);
      expect(result.illustrations).toHaveLength(18); // Policy term
      expect(result.summary.total_premiums_paid).toBe(800000); // 80000 * 10
      
      // Check first year
      const firstYear = result.illustrations[0];
      expect(firstYear.year).toBe(1);
      expect(firstYear.age).toBe(30);
      expect(firstYear.premium_paid).toBe(80000);
      expect(firstYear.cumulative_premium).toBe(80000);
      expect(firstYear.guaranteed_addition).toBe(60000); // 5% of 1200000
      
      // Check year after premium paying term
      const yearAfterPPT = result.illustrations[10]; // Year 11
      expect(yearAfterPPT.premium_paid).toBe(0);
      expect(yearAfterPPT.cumulative_premium).toBe(800000); // No more premiums
      expect(yearAfterPPT.guaranteed_addition).toBe(0); // No more additions
      
      // Check final year
      const finalYear = result.illustrations[17]; // Year 18
      expect(finalYear.total_benefit).toBe(1800000); // Sum assured + cumulative guaranteed additions
    });

    test('should calculate surrender value correctly', () => {
      const result = CalculationService.calculateBenefitIllustration(testPolicyData);
      
      // Year 1 and 2 should have no surrender value
      expect(result.illustrations[0].surrender_value).toBe(0);
      expect(result.illustrations[1].surrender_value).toBe(0);
      
      // Year 3 should have surrender value (80% of cumulative premium)
      expect(result.illustrations[2].surrender_value).toBe(192000); // 80% of 240000
    });

    test('should calculate death benefit correctly', () => {
      const result = CalculationService.calculateBenefitIllustration(testPolicyData);
      
      // Death benefit should be higher of sum assured or total benefit
      result.illustrations.forEach(illus => {
        expect(illus.death_benefit).toBeGreaterThanOrEqual(testPolicyData.sum_assured);
        expect(illus.death_benefit).toBeGreaterThanOrEqual(illus.total_benefit);
      });
    });
  });

  describe('calculateMaturityDetails', () => {
    const testPolicyData = {
      sum_assured: 1200000,
      modal_premium: 80000,
      premium_frequency: 'Yearly',
      policy_term: 18,
      premium_paying_term: 10,
      calculated_age: 30
    };

    test('should calculate maturity details correctly', () => {
      const result = CalculationService.calculateMaturityDetails(testPolicyData);
      
      expect(result.maturity_age).toBe(47); // 30 + 18 - 1
      expect(result.maturity_benefit).toBe(1800000);
      expect(result.total_premiums_paid).toBe(800000);
      expect(result.net_gain).toBe(1000000); // 1800000 - 800000
      expect(result.return_percentage).toBe(125); // (1000000/800000) * 100
    });
  });

  describe('validateCalculationInputs', () => {
    test('should pass validation for complete data', () => {
      const data = {
        sum_assured: 1200000,
        modal_premium: 80000,
        premium_frequency: 'Yearly',
        policy_term: 18,
        premium_paying_term: 10,
        calculated_age: 30
      };
      
      const result = CalculationService.validateCalculationInputs(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for missing fields', () => {
      const incompleteData = {
        sum_assured: 1200000,
        modal_premium: 80000
        // Missing other required fields
      };
      
      const result = CalculationService.validateCalculationInputs(incompleteData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing required fields');
    });
  });

  describe('calculateBulkIllustrations', () => {
    test('should process multiple policies correctly', async () => {
      const policiesData = [
        {
          id: '1',
          sum_assured: 1200000,
          modal_premium: 80000,
          premium_frequency: 'Yearly',
          policy_term: 18,
          premium_paying_term: 10,
          calculated_age: 30
        },
        {
          id: '2',
          sum_assured: 1000000,
          modal_premium: 50000,
          premium_frequency: 'Yearly',
          policy_term: 15,
          premium_paying_term: 8,
          calculated_age: 25
        }
      ];

      const results = await CalculationService.calculateBulkIllustrations(policiesData);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].policy_id).toBe('1');
      expect(results[1].policy_id).toBe('2');
    });

    test('should handle invalid data in bulk processing', async () => {
      const policiesData = [
        {
          id: '1',
          // Missing required fields
          sum_assured: 1200000
        }
      ];

      const results = await CalculationService.calculateBulkIllustrations(policiesData);
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].errors).toBeDefined();
      expect(results[0].errors.length).toBeGreaterThan(0);
    });
  });
});
