class CalculationService {
  
  /**
   * Calculate annual premium based on modal premium and frequency
   */
  static calculateAnnualPremium(modalPremium, frequency) {
    const frequencyMultipliers = {
      'Yearly': 1,
      'Half-Yearly': 2,
      'Monthly': 12
    };
    
    return modalPremium * (frequencyMultipliers[frequency] || 1);
  }

  /**
   * Calculate benefit illustration based on policy parameters
   * This implements the logic shown in the spreadsheet
   */
  static calculateBenefitIllustration(policyData) {
    const {
      sum_assured,
      modal_premium,
      premium_frequency,
      policy_term,
      premium_paying_term,
      calculated_age
    } = policyData;

    const annualPremium = this.calculateAnnualPremium(modal_premium, premium_frequency);
    const illustrations = [];

    // Calculate for each year of the policy
    for (let year = 1; year <= policy_term; year++) {
      const currentAge = calculated_age + year - 1;
      
      // Premium paid in current year (only during premium paying term)
      const premiumPaid = year <= premium_paying_term ? annualPremium : 0;
      
      // Cumulative premium
      const cumulativePremium = year <= premium_paying_term 
        ? annualPremium * year 
        : annualPremium * premium_paying_term;

      // Guaranteed addition calculation (simplified - 5% of sum assured annually)
      const guaranteedAddition = year <= premium_paying_term ? sum_assured * 0.05 : 0;
      const cumulativeGuaranteedAddition = sum_assured * 0.05 * Math.min(year, premium_paying_term);

      // Total benefit calculation
      const totalBenefit = sum_assured + cumulativeGuaranteedAddition;

      // Surrender value (simplified - 80% of total premiums paid after 3 years)
      const surrenderValue = year >= 3 ? cumulativePremium * 0.8 : 0;

      // Death benefit (higher of sum assured or total benefit)
      const deathBenefit = Math.max(sum_assured, totalBenefit);

      illustrations.push({
        year,
        age: currentAge,
        premium_paid: premiumPaid,
        cumulative_premium: cumulativePremium,
        guaranteed_addition: guaranteedAddition,
        cumulative_guaranteed_addition: cumulativeGuaranteedAddition,
        total_benefit: totalBenefit,
        surrender_value: surrenderValue,
        death_benefit: deathBenefit
      });
    }

    return {
      annual_premium: annualPremium,
      illustrations,
      summary: {
        total_premiums_paid: annualPremium * premium_paying_term,
        maturity_benefit: illustrations[illustrations.length - 1].total_benefit,
        total_guaranteed_additions: illustrations[illustrations.length - 1].cumulative_guaranteed_addition
      }
    };
  }

  /**
   * Calculate policy maturity details
   */
  static calculateMaturityDetails(policyData) {
    const illustration = this.calculateBenefitIllustration(policyData);
    const lastYear = illustration.illustrations[illustration.illustrations.length - 1];
    
    return {
      maturity_age: lastYear.age,
      maturity_benefit: lastYear.total_benefit,
      total_premiums_paid: illustration.summary.total_premiums_paid,
      net_gain: lastYear.total_benefit - illustration.summary.total_premiums_paid,
      return_percentage: ((lastYear.total_benefit - illustration.summary.total_premiums_paid) / illustration.summary.total_premiums_paid) * 100
    };
  }

  /**
   * Validate calculation inputs before processing
   */
  static validateCalculationInputs(data) {
    const required = ['sum_assured', 'modal_premium', 'premium_frequency', 'policy_term', 'premium_paying_term', 'calculated_age'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return {
        isValid: false,
        errors: [`Missing required fields: ${missing.join(', ')}`]
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Bulk calculation for scalability (process multiple policies)
   */
  static async calculateBulkIllustrations(policiesData, batchSize = 1000) {
    const results = [];
    
    for (let i = 0; i < policiesData.length; i += batchSize) {
      const batch = policiesData.slice(i, i + batchSize);
      
      const batchResults = batch.map(policyData => {
        try {
          const validation = this.validateCalculationInputs(policyData);
          if (!validation.isValid) {
            return {
              policy_id: policyData.id || i,
              success: false,
              errors: validation.errors
            };
          }

          const calculation = this.calculateBenefitIllustration(policyData);
          return {
            policy_id: policyData.id || i,
            success: true,
            data: calculation
          };
        } catch (error) {
          return {
            policy_id: policyData.id || i,
            success: false,
            errors: [error.message]
          };
        }
      });

      results.push(...batchResults);
      
      // Add small delay between batches to prevent overwhelming the system
      if (i + batchSize < policiesData.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return results;
  }
}

module.exports = CalculationService;
