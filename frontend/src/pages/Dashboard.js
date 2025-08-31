import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CardActions,
  Chip
} from '@mui/material';
import { CalculateOutlined, PolicyOutlined, PersonOutline } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { policyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const response = await policyAPI.getUserPolicies();
        setPolicies(response.data.policies);
      } catch (error) {
        console.error('Failed to load policies:', error);
      }
      setLoading(false);
    };

    loadPolicies();
  }, []);

  const handleCalculateNew = () => {
    navigate('/calculate');
  };

  const handleViewPolicy = (policyId) => {
    navigate(`/policies/${policyId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Benefit Illustration Module
        </Typography>
        <Typography variant="h6">
          Hello, {user?.name}!
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
          Calculate and manage your insurance policy benefits with our comprehensive illustration tool.
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={handleCalculateNew}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CalculateOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Calculate New Policy
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Input your policy parameters and calculate benefit illustrations
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="contained" size="small">
                Start Calculation
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/policies')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <PolicyOutlined sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                My Policies
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View and manage your saved policy calculations
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="outlined" size="small">
                View Policies ({policies.length})
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <PersonOutline sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage your account settings and information
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="outlined" size="small">
                View Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Policies */}
      {policies.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Policies
          </Typography>
          
          <Grid container spacing={2}>
            {policies.slice(0, 3).map((policy) => (
              <Grid item xs={12} md={4} key={policy.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Policy #{policy.id.slice(-8)}
                      </Typography>
                      <Chip 
                        label={policy.policy_status} 
                        color={policy.policy_status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary">Sum Assured:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>₹{policy.sum_assured.toLocaleString()}</Typography>
                    
                    <Typography variant="body2" color="textSecondary">Annual Premium:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>₹{policy.annual_premium.toLocaleString()}</Typography>
                    
                    <Typography variant="body2" color="textSecondary">Policy Term:</Typography>
                    <Typography variant="body1">{policy.policy_term} years</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleViewPolicy(policy.id)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {policies.length > 3 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/policies')}>
                View All Policies ({policies.length})
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Empty State */}
      {policies.length === 0 && !loading && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Policies Yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Start by calculating your first policy illustration
          </Typography>
          <Button variant="contained" onClick={handleCalculateNew}>
            Calculate Your First Policy
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
