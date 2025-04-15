// src/pages/RobotAccessApproval.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRobot } from '../api/robotContext';
import { Alert, Spinner, Button, Card, Container } from 'react-bootstrap';

const RobotAccessApproval = () => {
  // Get robotId and requesterId from URL parameters
  const { robotId, requesterId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the approveRobotAccess function from context
  const { approveRobotAccess } = useRobot();
  
  useEffect(() => {
    // Function to handle the approval process
    const processApproval = async () => {
      try {
        setIsProcessing(true);
        // Call the approveRobotAccess method from robotService
        const result = await approveRobotAccess(robotId, requesterId);
        setSuccess(true);
        setError(null);
      } catch (err) {
        console.error("Error approving access:", err);
        setError(err.message || "Failed to approve access. Please try again.");
        setSuccess(false);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Only process if we have both parameters
    if (robotId && requesterId) {
      processApproval();
    } else {
      setError("Missing required information for approval");
      setIsProcessing(false);
    }
  }, [robotId, requesterId, approveRobotAccess]);
  
  return (
    <Container className="py-5">
      <Card className="shadow">
        <Card.Header as="h4" className="bg-primary text-white">
          Robot Access Approval
        </Card.Header>
        <Card.Body className="text-center p-4">
          {isProcessing ? (
            <div className="text-center">
              <Spinner animation="border" role="status" className="mb-3" />
              <p>Processing your approval request...</p>
            </div>
          ) : success ? (
            <>
              <Alert variant="success" className="mb-4">
                <Alert.Heading>Access Approved Successfully!</Alert.Heading>
                <p>
                  You have successfully granted access to your robot.
                  The user can now view and interact with this robot.
                </p>
              </Alert>
              <Button 
                variant="primary" 
                onClick={() => navigate('/dashboard')}
                className="me-2"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/robots')}
              >
                View All Robots
              </Button>
            </>
          ) : (
            <>
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>Approval Failed</Alert.Heading>
                <p>{error || "An unexpected error occurred. Please try again."}</p>
              </Alert>
              <Button 
                variant="primary" 
                onClick={() => navigate('/dashboard')}
                className="me-2"
              >
                Go to Dashboard
              </Button>
              <Link to="/support" className="btn btn-outline-secondary">
                Contact Support
              </Link>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RobotAccessApproval;