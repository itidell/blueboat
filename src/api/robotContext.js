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
  const [ pendingRequests, setPendingRequests ] = useState([]);
  const { notifyAccessRequest } = useNotifications();

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
      setError(error.message || "Failed to add robot");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a robot
  const updateRobot = async (robotId, robotData) => {
    try {
      setLoading(true);
      setError(null);
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
      setError(error.message || "Failed to update robot");
      throw error;
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
      setError(error.message || "Failed to delete robot");
      throw error;
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
      setError(error.message || "Failed to get robot");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordRobotAccess = async (robotId) =>{
    try{
      setLoading(true);
      setError(null);
      const result = await robotService.recordRobotAccess(robotId);
      return result;
    } catch (error){
      console.error("Error recording robot access", error);
      setError(error.message || "Failed to record robot access");
      throw error;
    } finally{
      setLoading(false);
    }
  };
  const approveRobotAccess = async (robotId, requesterId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.approveRobotAccess(robotId, requesterId);
      await loadPendingAccessRequests();
      return result;
    } catch (error) {
      console.error("Error approving robot access:", error);
      setError(error.response?.data?.detail || error.message || "Failed to approve robot access");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAccessRequests = async () =>{
    try{
      setLoading(true);
      setError(null);
      const requests = await robotService.getPendingAccessRequest();
      setPendingRequests(requests);
      return requests;
    } catch (error){
      console.error("Error loading access requests:", error);
      setError(error.message || "Failed to load access requests");
      return [];
    } finally{
      setLoading(false);
    }
  };
  const requestRobotAccess = async (robotId, ownerEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.requestRobotAccess(robotId, ownerEmail);
      return result;
    } catch (error) {
      console.error("Error requesting robot access:", error); 
      setError(error.response?.data?.detail || error.message || "Failed to request robot access");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load robots on mount
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
        pendingRequests,
        loadPendingAccessRequests,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};