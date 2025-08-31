import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import { calculationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const validationRules = {
  premium_paying_term: { min: 5, max: 10 },
  policy_term: { min: 10, max: 20 },
  modal_premium: { min: 10000, max: 100000 },
  sum_assured: { min: 500000 },
  age: { min: 23, max: 56 },
  custom_rules: [
    'Policy Term (PT) must be greater than Premium Paying Term (PPT)',
    'Sum assured must be minimum of 10 times premium or ₹5,00,000, whichever is higher'
  ]
};

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function validateInputs(data) {
  const errors = [];
  // Date of birth
  if (!data.dob) {
    errors.push('Date of birth is required');
  } else {
    const dobDate = new Date(data.dob);
    if (dobDate > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }
    const age = calculateAge(data.dob);
    if (age < validationRules.age.min) {
      errors.push('Age must be minimum 23');
    }
    if (age > validationRules.age.max) {
      errors.push('Age must be maximum 56');
    }
  }
  // Sum assured
  if (!data.sum_assured) {
    errors.push('Sum assured is required');
  } else {
    const minSumAssured = Math.max(data.modal_premium * 10 || 0, validationRules.sum_assured.min);
    if (Number(data.sum_assured) < minSumAssured) {
      errors.push(`Sum assured must be minimum of ${minSumAssured} (10 times premium or ₹5,00,000, whichever is higher)`);
    }
  }
  // Modal premium
  if (!data.modal_premium) {
    errors.push('Modal premium is required');
  } else {
    if (Number(data.modal_premium) < validationRules.modal_premium.min) {
      errors.push('Premium must be minimum ₹10,000');
    }
    if (Number(data.modal_premium) > validationRules.modal_premium.max) {
      errors.push('Premium must be maximum ₹1,00,000');
    }
  }
  // Premium frequency
  if (!['Yearly', 'Half-Yearly', 'Monthly'].includes(data.premium_frequency)) {
    errors.push('Premium frequency is required');
  }
  // Policy term
  if (!data.policy_term) {
    errors.push('Policy term is required');
  } else {
    if (Number(data.policy_term) < validationRules.policy_term.min) {
      errors.push('Policy term (PT) must be minimum 10');
    }
    if (Number(data.policy_term) > validationRules.policy_term.max) {
      errors.push('Policy term (PT) must be maximum 20');
    }
  }
  // Premium paying term
  if (!data.premium_paying_term) {
    errors.push('Premium paying term is required');
  } else {
    if (Number(data.premium_paying_term) < validationRules.premium_paying_term.min) {
      errors.push('Premium paying term (PPT) must be minimum 5');
    }
    if (Number(data.premium_paying_term) > validationRules.premium_paying_term.max) {
      errors.push('Premium paying term (PPT) must be maximum 10');
    }
  }
  // PT > PPT
  if (
    data.policy_term &&
    data.premium_paying_term &&
    Number(data.policy_term) <= Number(data.premium_paying_term)
  ) {
    errors.push('Policy Term (PT) must be greater than Premium Paying Term (PPT)');
  }
  return errors;
}

const PolicyCalculation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sum_assured: '',
    modal_premium: '',
    premium_frequency: 'Yearly',
    policy_term: '',
    premium_paying_term: '',
    dob: user?.dob || ''
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Real-time validation when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidationErrors(validateInputs(formData));
    }, 500); // Debounce validation
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setCalculation(null); // Clear previous calculation
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    const errors = validateInputs(formData);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setLoading(true);
    try {
      const response = await calculationAPI.calculateIllustration(formData);
      setCalculation(response.data);
    } catch (error) {
      setValidationErrors([
        error.response?.data?.error || 'Calculation failed',
        ...(error.response?.data?.details || [])
      ]);
    }
    setLoading(false);
  };

  const handleSavePolicy = () => {
    if (calculation) {
      navigate('/illustration', {
        state: {
          calculation,
          inputs: formData
        }
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Policy Calculation
            </Typography>

            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Box component="form" onSubmit={handleCalculate}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    helperText="Age must be between 23-56 years"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Sum Assured"
                    name="sum_assured"
                    type="number"
                    value={formData.sum_assured}
                    onChange={handleChange}
                    helperText="Minimum 10 times premium or ₹5,00,000"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Modal Premium"
                    name="modal_premium"
                    type="number"
                    value={formData.modal_premium}
                    onChange={handleChange}
                    helperText="₹10,000 - ₹1,00,000"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Premium Frequency</InputLabel>
                    <Select
                      name="premium_frequency"
                      value={formData.premium_frequency}
                      label="Premium Frequency"
                      onChange={handleChange}
                    >
                      <MenuItem value="Yearly">Yearly</MenuItem>
                      <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Policy Term (PT)"
                    name="policy_term"
                    type="number"
                    value={formData.policy_term}
                    onChange={handleChange}
                    helperText="10-20 years"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Premium Paying Term (PPT)"
                    name="premium_paying_term"
                    type="number"
                    value={formData.premium_paying_term}
                    onChange={handleChange}
                    helperText="5-10 years (must be < PT)"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || validationErrors.length > 0}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Calculating...' : 'Calculate'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Validation Rules */}
          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Validation Rules
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>PPT: {validationRules.premium_paying_term.min}-{validationRules.premium_paying_term.max} years</li>
                <li>PT: {validationRules.policy_term.min}-{validationRules.policy_term.max} years</li>
                <li>Premium: ₹{validationRules.modal_premium.min.toLocaleString()}-₹{validationRules.modal_premium.max.toLocaleString()}</li>
                <li>Age: {validationRules.age.min}-{validationRules.age.max} years</li>
                {validationRules.custom_rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </Typography>
          </Paper>
        </Grid>

        {/* Calculation Results */}
        <Grid item xs={12} md={6}>
          {calculation ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Calculation Results
              </Typography>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Policy Summary
                  </Typography>
                  <Typography variant="body1">
                    <strong>Annual Premium:</strong> ₹
                    {typeof calculation.calculation.annual_premium === 'number'
                      ? calculation.calculation.annual_premium.toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Total Premiums to be Paid:</strong> ₹
                    {typeof calculation.calculation.summary?.total_premiums_paid === 'number'
                      ? calculation.calculation.summary.total_premiums_paid.toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Maturity Benefit:</strong> ₹
                    {typeof calculation.calculation.summary?.maturity_benefit === 'number'
                      ? calculation.calculation.summary.maturity_benefit.toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Calculated Age:</strong> {calculation.inputs?.calculated_age ?? 'N/A'} years
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="secondary" gutterBottom>
                    Maturity Details
                  </Typography>
                  <Typography variant="body1">
                    <strong>Maturity Age:</strong> {calculation.maturity_details?.maturity_age ?? 'N/A'} years
                  </Typography>
                  <Typography variant="body1">
                    <strong>Net Gain:</strong> ₹
                    {typeof calculation.maturity_details?.net_gain === 'number'
                      ? calculation.maturity_details.net_gain.toLocaleString()
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Return %:</strong>
                    {typeof calculation.maturity_details?.return_percentage === 'number'
                      ? calculation.maturity_details.return_percentage.toFixed(2)
                      : 'N/A'}%
                  </Typography>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSavePolicy}
                >
                  View Full Illustration
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCalculation(null)}
                >
                  Clear Results
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', opacity: 0.7 }}>
              <Typography variant="h6" color="textSecondary">
                Calculation Results
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Fill in the form and click "Calculate" to see results
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PolicyCalculation;
