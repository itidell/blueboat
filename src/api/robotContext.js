// src/api/robotContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { robotService } from "./robotService";

const RobotContext = createContext();

export const useRobot = () => useContext(RobotContext);

export const RobotProvider = ({ children }) => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRobot, setCurrentRobot] = useState(null);

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

  // Load robots on mount
  useEffect(() => {
    loadRobots();
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
        setCurrentRobot
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};