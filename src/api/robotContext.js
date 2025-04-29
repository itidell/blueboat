// src/api/robotContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { robotService } from "./robotService";
import { useNotifications } from "./notificationContext";
import { database } from '../utils/firebaseConfig';
import { ref, onValue, off } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../utils/firebaseConfig"; // Ensure this is the correct import for your Firebase app
const RobotContext = createContext();
const BATTERY_LOW_THRESHOLD = 20;

export const useRobot = () => useContext(RobotContext);

export const RobotProvider = ({ children }) => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realtimeError, setRealtimeError] = useState(null);
  const [controlError, setControlError] = useState(null);
  const [currentRobot, setCurrentRobot] = useState(null);
  const [commandLoading, setCommandLoading] = useState(false);
  const [controlHistory, setControlHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingRequestError, setPendingRequestError] = useState(null); // Separate error state
  const [pendingRequestLoading, setPendingRequestLoading] = useState(false); // Separate loading state
  const HISTORY_PAGE_LIMIT = 20;
  const realtimeListenerRef = useRef(null);
  const controlListenerRef = useRef(null);
  const { 
    notifyAccessRequest, 
    notifyBatteryLow,
    notifyAccessGranted, 
    notifyAccessRequestSent,
    notifyRobotAccessed,
    notifyAccessDenied,
    refreshNotifications
  } = useNotifications();

  const clearError = useCallback(() =>{
    setError(null);
  }, []);

  const clearHistoryError = useCallback(() =>{
    setHistoryError(null);
  }, []);

  const clearPendingRequestError = useCallback(() =>{
    setPendingRequestError(null);
  }, []);

  const checkRobotBatteryLevel = useCallback((robot) =>{
    if (!robot) return;
    const batteryLevel = robot.realtime?.battery?.level_percentage;
    if(batteryLevel !== undefined && batteryLevel !== null && batteryLevel <= BATTERY_LOW_THRESHOLD){
      console.log(`Battery low detected for ${robot.robot_id}: ${batteryLevel}% - Attempting notification.`);
      notifyBatteryLow(robot.robot_id, batteryLevel);
    }
  }, [notifyBatteryLow]);

  const detachFirebaseListener = useCallback(() => {
    console.log("Firebase listener detected. Attempting to remove it.");
    if (realtimeListenerRef.current){
      try{
        off(realtimeListenerRef.current);
        console.log(`Detached realtime listener for path: ${realtimeListenerRef.current.path}`);
        realtimeListenerRef.current = null;
      }catch (e){
        console.error("Error detaching realtime listener:", e); 
      }
    }
    if (controlListenerRef.current){
      try{
       off(controlListenerRef.current);
       console.log(`Detached control listener for path: ${controlListenerRef.current.path}`);
       controlListenerRef.current = null;
      } catch (e){
        console.error("Error detaching control listener:", e);
      }
    }
    setRealtimeLoading(false);
  }, []);

  const loadControlHistory = useCallback(async(robotId, loadMore = false) =>{
    if(!robotId) return;
    if(historyLoading && !loadMore) return;
    if(loading && loadMore) return;
  
    console.log(`Loading control history for ${robotId}. Load More: ${loadMore}, Current Page: ${historyPage}`);
    setHistoryLoading(true);
    setHistoryError();
    const pageToLoad = loadMore ? historyPage + 1 : 0;
    const skip = pageToLoad * HISTORY_PAGE_LIMIT;
    try{
      const historyData = await robotService.getControlHistory(robotId, skip, HISTORY_PAGE_LIMIT);
      if (historyData && historyData.length > 0){
          setControlHistory(prevHistory => { 
          const existingIds = new Set(prevHistory.map(item => item.id));
          const newUniqueItems = historyData.filter(item => !existingIds.has(item.id));
          const combined = loadMore ? [...prevHistory, ...newUniqueItems] : historyData;
            
          return combined.sort((a , b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      });
          setHistoryPage(pageToLoad);
          setHasMoreHistory(historyData.length === HISTORY_PAGE_LIMIT);
          console.log(`Loaded ${historyData.length} history items. Has More: ${hasMoreHistory}`);  
      } else {
        console.log("No more history items received.");
        if (!loadMore){
          setControlHistory([]);
        }
        setHasMoreHistory(false);
      }
    } catch (err){
      console.error("Error in loadControlHistory context:", err);
      setHistoryError(err.message || "Failed to load history.");
      setHasMoreHistory(false);
    } finally{
      setHistoryLoading(false);
    }
  }, [ historyLoading, historyPage, hasMoreHistory, HISTORY_PAGE_LIMIT, clearHistoryError]);
  
  useEffect(() => {
    detachFirebaseListener();
    setControlError(null);
    setRealtimeError(null);
    if ( currentRobot && currentRobot.robot_id){
      console.log("Setting up Firebase listeners for robot:", currentRobot.robot_id);
      setRealtimeLoading(true);

      const robotId = currentRobot.robot_id;
      const realtimePath = `robots/${robotId}/realtime_data`;
      const controlPath = `robots/${robotId}/control`;

      try{
        const realtimeDBRef = ref(database, realtimePath);
        const controlDBRef = ref(database, controlPath);
        const onRealtimeValueChange = (snapshot) =>{
          setRealtimeError(null);
          const realtimeData = snapshot.val();
          console.log(`Firebase realtime_data update for ${robotId}:`, realtimeData ? "Data received" : "No data/null");
          setCurrentRobot(prevRobot =>{
            if (prevRobot && prevRobot.robot_id === robotId){
              const updatedRobot = {
                ...prevRobot,
                realtime: realtimeData || {}
              }
              checkRobotBatteryLevel(updatedRobot);
              return updatedRobot;
            }
            return prevRobot;
          });
          setRealtimeLoading(false);
        };

        const onRealtimeError = (error) =>{
          console.error(`Firebase realtime listener error for ${robotId}:`, error);
          setError(`Real-time data unavailable: ${error.message}`);
          setRealtimeLoading(false);
          detachFirebaseListener();
        }
        const currentUser = getAuth(app).currentUser;
        if (currentUser) {
          console.log(`FIREBASE AUTH CHECK: Attaching listener for robot ${robotId}. Current auth UID: '${currentUser.uid}' (Type: ${typeof currentUser.uid})`);
      } else {
        console.error(`FIREBASE AUTH CHECK: Cannot attach listener for robot ${robotId}. No authenticated user found!`);
      }
        onValue(realtimeDBRef, onRealtimeValueChange, onRealtimeError);
        realtimeListenerRef.current = realtimeDBRef
        const onControlValueChange = (snapshot) =>{
          const controlData = snapshot.val();
          console.log(`Firebase control update for ${robotId}:`, controlData ? "Data received" : "No data/null");
          setCurrentRobot(prevRobot =>{
            if (prevRobot && prevRobot.robot_id === robotId){
              const updatedRobot = {
                ...prevRobot,
                control: controlData || {}
              }
              return updatedRobot;
            }
            return prevRobot;
          });

        };
        const onControlError = (error) =>{
          console.error(`Firebase control listener error for ${robotId}:`, error);
          if (error.code === "PERMISSION_DENIED") {
            setError(`Access denied: You don't have permission to control this robot.`);
          } else {
            setError(`Control data unavailable: ${error.message}`);
          }
          
          detachFirebaseListener(); 
        }
        onValue(controlDBRef, onControlValueChange, onControlError);
        controlListenerRef.current = controlDBRef; 

      }catch (error){
        console.error("Error setting up Firebase listeners:", error);
          setError(`Failed to initialize real-time connection: ${error.message}`);
          setRealtimeLoading(false);
      }
    } else{
      console.log("No current robot, listeners not attached.");
      setRealtimeLoading(false);
    }
    return () => {
      detachFirebaseListener();
    };
  }, [currentRobot?.robot_id, detachFirebaseListener, checkRobotBatteryLevel])
  // Load user's robots
  const loadRobots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const robotData = await robotService.getUserRobots();
      setRobots(robotData);
      if (robotData && robotData.length > 0) {
        robotData.forEach(robot => checkRobotBatteryLevel(robot));
      }
      return robotData;
    } catch (error) {
      console.error("Error loading robots:", error);
      setError(error.message || "Failed to load robots");
      return [];
    } finally {
      setLoading(false);
    }
  }, [checkRobotBatteryLevel]);

  // Create a new robot
  const addRobot = async (robotData) => {
    try {
      setLoading(true);
      setError(null);
      const newRobot = await robotService.createRobot(robotData);
      checkRobotBatteryLevel(newRobot);
      await loadRobots();
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
      
      const updatedRobot = await robotService.updateRobot(robotId, robotData);
      setRobots(prev => 
        prev.map(robot => robot.robot_id === robotId ? updatedRobot : robot)
      );
      if (currentRobot && currentRobot.robot_id === robotId) {
        setCurrentRobot(updatedRobot);
      }
      checkRobotBatteryLevel(updatedRobot);
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
      setRobots(prev => prev.filter(robot => robot.robot_id !== robotId));
      if (currentRobot && currentRobot.robot_id === robotId) {
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
  const getRobot = useCallback(async (robotId) => {
    if(!robotId){
      console.warn("getRobot: robotId is missing");
      setCurrentRobot(null);
      setError("No robot ID provided.");
      setRealtimeLoading(false);
      return null;
    }
    detachFirebaseListener();
    console.log(`Fetching static data for robot: ${robotId}`);
    setLoading(true);
    setRealtimeLoading(true);
    clearError();
    try {
      const robotStaticData = await robotService.getRobot(robotId);
      if (robotStaticData){
        console.log(`Static data received for ${robotId}, setting current robot.`);
        setCurrentRobot({...robotStaticData, realtime: robotStaticData.realtime || {}, control: robotStaticData.control || {}});
        setLoading(false);
      }else{
        console.warn(`getRobot service returned no data for ${robotId}`);
        setCurrentRobot(null);
        setError("Robot not found or access denied.");
        setLoading(false);
        setRealtimeLoading(false);
      }
      return robotStaticData;
    } catch (error) {
      console.error("Error getting robot:", error);
      setCurrentRobot(null);
      const detail = error.detail || error.message || "Failed to load robot details";
      if (typeof detail ==="string" && detail.includes("pending approval")){
        setError("Your access request is pending approval.");
      } else if (error.status === 404) {
        setError("Robot not found or access denied.");
      } else {
        setError(detail);
      }
      setLoading(false);
      setRealtimeLoading(false);
      return null;
    }
  },[detachFirebaseListener, clearError]);

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

  const loadPendingAccessRequests = useCallback( async () => {
    try {
      setPendingRequestLoading(true);
      setPendingRequestError();
      const requests = await robotService.getPendingAccessRequest();
      console.log("Attempting to load pending access requests...");
      setPendingRequests(requests || []);
      console.log(`Successfully loaded ${requests?.length || 0} pending requests.`);
      return requests;
    } catch (error) {
      console.error("Error loading access requests:", error);
      let specificErrorMsg = "Failed to load pending access requests.";
            if (error && error.detail && typeof error.detail === 'string' && !error.detail.toLowerCase().includes('not authorized')) {
                 // Only use backend detail if it's informative and not a generic auth issue
                 // Let's avoid showing "Robot not found" as it's confusing here.
                 if (!error.detail.includes("Robot not found")) {
                    specificErrorMsg = error.detail;
                 } else {
                    specificErrorMsg = "An issue occurred while checking for pending requests."; // More generic
                 }
            } else if (error && error.message && !error.message.toLowerCase().includes('401')) {
                 specificErrorMsg = error.message;
            }

            setPendingRequestError(specificErrorMsg);
            setPendingRequests([]); // Clear requests on error
    } finally {
      setPendingRequestLoading(false);
    }
  }, [clearPendingRequestError]);
  
  const requestRobotAccess = async (robotId, ownerEmail) => {
    try {
      setLoading(true);
      setError(null);
      const result = await robotService.requestRobotAccess(robotId, ownerEmail);
      
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
  const refreshAllData = useCallback(async () => {
    await refreshNotifications();
  }, [refreshNotifications]);
  
  const sendRobotCommand = useCallback(async (robotId, command) => {
    if (!robotId){
      console.error("sendRobotCommand: robotId is missing");
      return false;
    }

    setCommandLoading(true);
    let success = false;
    try {
      await robotService.sendControlCommand(robotId, command);
      success = true ; 
      setCommandLoading(false);
      return true;
    }catch (err){
      console.error("Error in sendRobotCommand context:", err);
      setError(err.message || "Failed to send command.");
      success = false
      return false;
    } finally {
      setCommandLoading(false);
    }
    return success;
  }, [setError]);

  const acquireRobotControl = useCallback(async (robotId) =>{
    if (!robotId){
      setError("Cannot acquire control: No robot selected.");
      return false;
    }
    setLoading(true);
    setError(null);
    try{
      await robotService.acquireControl(robotId);
      setLoading(false);
      return true;
    }catch (err){
      console.error("Error acquiring control:", err);
      setError(err.message || "Failed to acquire control.");
      setLoading(false);
      return false;
    }
  }, []);

  const releaseRobotControl = useCallback(async (robotId) =>{
    if (!robotId){
      setError("Cannot release control: No robot selected.");
      return false;
    }
    setLoading(true);
    setError(null);
    try{
      await robotService.releaseControl(robotId);
      setLoading(false);
      return true;
    }catch (err){
      console.error("Error releasing control:", err);
      setError(err.message || "Failed to release control.");
      setLoading(false);
      return false;
    }
  }, []);

  // Load robots and pending requests on mount
  useEffect(() => {
    loadRobots();
    loadPendingAccessRequests();
  }, [loadRobots, loadPendingAccessRequests]);

  return (
    <RobotContext.Provider
      value={{
        robots,
        currentRobot,
        loading,
        realtimeLoading,
        commandLoading,
        error,
        pendingRequests,
        controlHistory,
        historyLoading,
        historyError,
        hasMoreHistory,
        pendingRequests,
        pendingRequestError,
        pendingRequestLoading,
        clearPendingRequestError,
        clearError,
        clearHistoryError,
        loadControlHistory,
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
        loadPendingAccessRequests,
        refreshAllData,
        sendRobotCommand,
        acquireRobotControl,
        releaseRobotControl,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};