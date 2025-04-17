// src/api/robotContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { robotService } from "./robotService";
import { useNotifications } from "./notificationContext";

const RobotContext = createContext();

export const useRobot = () => useContext(RobotContext);

export const RobotProvider = ({ children }) => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRobot, setCurrentRobot] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { 
    notifyAccessRequest, 
    notifyAccessGranted, 
    notifyAccessRequestSent,
    notifyRobotAccessed,
    notifyAccessDenied,
    refreshNotifications
  } = useNotifications();

  // Load user's robots
  const loadRobots = async () => {
    try {
      setLoading(true);
      setError(null);
      const robotData = await robotService.getUserRobots();
      setRobots(robotData);
      return robotData;
    } catch (error) {
      console.error("Error loading robots:", error);
      setError(error.message || "Failed to load robots");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new robot
  const addRobot = async (robotData) => {
    try {
      setLoading(true);
      setError(null);
      const newRobot = await robotService.createRobot(robotData);
      setRobots(prev => [...prev, newRobot]);
      return newRobot;
    } catch (error) {
      console.error("Error adding robot:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add robot";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update a robot
  const updateRobot = async (robotId, robotData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Store the old robot data for comparison (for notifications)
      const oldRobot = robots.find(r => r.id === robotId);
      
      const updatedRobot = await robotService.updateRobot(robotId, robotData);
      setRobots(prev => 
        prev.map(robot => robot.id === robotId ? updatedRobot : robot)
      );
      if (currentRobot && currentRobot.id === robotId) {
        setCurrentRobot(updatedRobot);
      }
      return updatedRobot;
    } catch (error) {
      console.error("Error updating robot:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to update robot";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete a robot
  const deleteRobot = async (robotId) => {
    try {
      setLoading(true);
      setError(null);
      await robotService.deleteRobot(robotId);
      setRobots(prev => prev.filter(robot => robot.id !== robotId));
      if (currentRobot && currentRobot.id === robotId) {
        setCurrentRobot(null);
      }
      return true;
    } catch (error) {
      console.error("Error deleting robot:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to delete robot";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get a specific robot
  const getRobot = async (robotId) => {
    try {
      setLoading(true);
      setError(null);
      const robot = await robotService.getRobot(robotId);
      setCurrentRobot(robot);
      return robot;
    } catch (error) {
      console.error("Error getting robot:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to get robot";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const recordRobotAccess = async (robotId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.recordRobotAccess(robotId);
      
      // After successfully recording access, refresh notifications
      // to ensure any new ROBOT_ACCESSED notifications are loaded
      await refreshNotifications();
      
      return result;
    } catch (error) {
      console.error("Error recording robot access", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to record robot access";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const approveRobotAccess = async (robotId, requesterId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.approveRobotAccess(robotId, requesterId);
      
      notifyAccessGranted(robotId, "You")
      // Refresh data after successful approval
      await loadRobots();
      await loadPendingAccessRequests();
      
      // Make sure to refresh notifications to update the UI
      await refreshNotifications();
      
      return result;
    } catch (error) {
      console.error("Error approving robot access:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to approve robot access";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAccessRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = await robotService.getPendingAccessRequest();
      setPendingRequests(requests);
      return requests;
    } catch (error) {
      console.error("Error loading access requests:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to load access requests";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const requestRobotAccess = async (robotId, ownerEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.requestRobotAccess(robotId, ownerEmail);
      
      notifyAccessRequestSent(robotId, ownerEmail.split('@')[0] || "the owner");
      // After successfully requesting access, refresh notifications
      // to ensure any new ACCESS_REQUEST_SENT notifications are loaded
      await refreshNotifications();
      
      return result;
    } catch (error) {
      console.error("Error requesting robot access:", error); 
      const errorMessage = error.response?.data?.detail || error.message || "Failed to request robot access";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const denyRobotAccess = async (robotId, requesterId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.denyRobotAccess(robotId, requesterId);
      
      notifyAccessDenied(robotId, "You")
      // Refresh data after successful denial
      await loadPendingAccessRequests();
      
      // Make sure to refresh notifications to update the UI
      await refreshNotifications();
      
      return result;
    } catch (error) {
      console.error("Error denying robot access:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to deny robot access";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    await loadRobots();
    await loadPendingAccessRequests();
    await refreshNotifications();
  };

  // Load robots and pending requests on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadRobots();
      await loadPendingAccessRequests();
    };
    loadInitialData();
  }, []);

  return (
    <RobotContext.Provider
      value={{
        robots,
        currentRobot,
        loading,
        error,
        loadRobots,
        addRobot,
        updateRobot,
        deleteRobot,
        getRobot,
        setCurrentRobot,
        recordRobotAccess,
        requestRobotAccess,
        approveRobotAccess,
        denyRobotAccess,
        pendingRequests,
        loadPendingAccessRequests,
        refreshAllData,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};