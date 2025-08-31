import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation, useNavigate } from 'react-router-dom';
import { policyAPI } from '../services/api';

const Illustration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [calculationData, setCalculationData] = useState(null);
  const [inputs, setInputs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.calculation && location.state?.inputs) {
      setCalculationData(location.state.calculation);
      setInputs(location.state.inputs);
    } else {
      // Redirect back to calculation page if no data
      navigate('/calculate');
    }
  }, [location.state, navigate]);

  const handleSavePolicy = async () => {
    if (!calculationData || !inputs) return;
    
    setSaving(true);
    try {
      const policyData = {
        sum_assured: parseFloat(inputs.sum_assured),
        modal_premium: parseFloat(inputs.modal_premium),
        premium_frequency: inputs.premium_frequency,
        policy_term: parseInt(inputs.policy_term),
        premium_paying_term: parseInt(inputs.premium_paying_term)
      };

      const response = await policyAPI.createPolicy(policyData);
      
      // Navigate to policy details
      navigate(`/policies/${response.data.policy.id}`);
    } catch (error) {
      console.error('Failed to save policy:', error);
      alert('Failed to save policy. Please try again.');
    }
    setSaving(false);
  };

  // Define columns for the data grid
  const columns = [
    { field: 'year', headerName: 'Year', width: 80, type: 'number' },
    { field: 'age', headerName: 'Age', width: 80, type: 'number' },
    { 
      field: 'premium_paid', 
      headerName: 'Premium Paid', 
      width: 140, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'cumulative_premium', 
      headerName: 'Cumulative Premium', 
      width: 160, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'guaranteed_addition', 
      headerName: 'Guaranteed Addition', 
      width: 160, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'cumulative_guaranteed_addition', 
      headerName: 'Cumulative GA', 
      width: 140, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'total_benefit', 
      headerName: 'Total Benefit', 
      width: 140, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'surrender_value', 
      headerName: 'Surrender Value', 
      width: 140, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    },
    { 
      field: 'death_benefit', 
      headerName: 'Death Benefit', 
      width: 140, 
      type: 'number',
      valueFormatter: (params) => params.value !== undefined && params.value !== null ? `₹${params.value.toLocaleString()}` : '₹0'
    }
  ];

  if (!calculationData || !inputs) {
    return null;
  }

  const illustrations = calculationData.calculation.illustrations.map((item, index) => ({
    id: index + 1,
    ...item
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Policy Input Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Policy Benefit Illustration
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Policy Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Sum Assured:</Typography>
                    <Typography variant="body1"><strong>₹{parseFloat(inputs.sum_assured).toLocaleString()}</strong></Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Modal Premium:</Typography>
                    <Typography variant="body1"><strong>₹{parseFloat(inputs.modal_premium).toLocaleString()}</strong></Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Premium Frequency:</Typography>
                    <Typography variant="body1">{inputs.premium_frequency}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Policy Term:</Typography>
                    <Typography variant="body1">{inputs.policy_term} years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Premium Paying Term:</Typography>
                    <Typography variant="body1">{inputs.premium_paying_term} years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Current Age:</Typography>
                    <Typography variant="body1">{calculationData.inputs.calculated_age} years</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="secondary" gutterBottom>
                  Summary
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Annual Premium:</Typography>
                    <Typography variant="h6" color="primary">₹{calculationData.calculation.annual_premium.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Premiums:</Typography>
                    <Typography variant="body1">₹{calculationData.calculation.summary.total_premiums_paid.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Maturity Benefit:</Typography>
                    <Typography variant="body1" color="success.main">₹{calculationData.calculation.summary.maturity_benefit.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Net Gain:</Typography>
                    <Typography variant="body1" color="success.main">₹{calculationData.maturity_details.net_gain.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Return %:</Typography>
                    <Chip 
                      label={`${calculationData.maturity_details.return_percentage.toFixed(2)}%`} 
                      color="success" 
                      size="small" 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePolicy}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Policy'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/calculate')}
          >
            Back to Calculator
          </Button>
        </Box>
      </Paper>

      {/* Year-wise Illustration Table */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Year-wise Benefit Illustration
        </Typography>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={illustrations}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            checkboxSelection={false}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>
        
        {/* Alternative Basic Table for reference */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Key Milestones
          </Typography>
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell><strong>Milestone</strong></TableCell>
                  <TableCell align="right"><strong>Year</strong></TableCell>
                  <TableCell align="right"><strong>Age</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>First Premium</TableCell>
                  <TableCell align="right">1</TableCell>
                  <TableCell align="right">{calculationData.inputs.calculated_age}</TableCell>
                  <TableCell align="right">₹{calculationData.calculation.annual_premium.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Last Premium</TableCell>
                  <TableCell align="right">{inputs.premium_paying_term}</TableCell>
                  <TableCell align="right">{calculationData.inputs.calculated_age + parseInt(inputs.premium_paying_term) - 1}</TableCell>
                  <TableCell align="right">₹{calculationData.calculation.annual_premium.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Policy Maturity</TableCell>
                  <TableCell align="right">{inputs.policy_term}</TableCell>
                  <TableCell align="right">{calculationData.maturity_details.maturity_age}</TableCell>
                  <TableCell align="right">₹{calculationData.maturity_details.maturity_benefit.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default Illustration;
