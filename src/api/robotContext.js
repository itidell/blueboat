// src/api/robotContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { robotService } from "./robotService";
import { useNotifications } from "./notificationContext";
import { database } from '../utils/firebaseConfig';
import { ref, onValue, off, get } from "firebase/database"; // Import 'get' for a one-time read
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

  // Effect for currentRobot Firebase listeners
  useEffect(() => {
    // ... (Keep the existing useEffect for currentRobot Firebase listeners) ...
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
          // Only detach if user does not have access, otherwise Firebase will retry internally
           if (error.code === "PERMISSION_DENIED") {
                console.warn(`Permission denied for robot ${robotId}. Detaching listener.`);
                detachFirebaseListener();
            } else {
                 console.log(`Firebase error code ${error.code}. Listener may attempt to reconnect.`);
            }
        }

        const currentUser = getAuth(app).currentUser;
        if (currentUser) {
          console.log(`FIREBASE AUTH CHECK: Attaching listener for robot ${robotId}. Current auth UID: '${currentUser.uid}' (Type: ${typeof currentUser.uid})`);
      } else {
        console.error(`FIREBASE AUTH CHECK: Cannot attach listener for robot ${robotId}. No authenticated user found!`);
      }
        onValue(realtimeDBRef, onRealtimeValueChange, onRealtimeError);
        realtimeListenerRef.current = realtimeDBRef;

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
             detachFirebaseListener(); // Detach on permission denied
          } else {
             setError(`Control data unavailable: ${error.message}`);
             console.log(`Firebase error code ${error.code}. Listener may attempt to reconnect.`);
          }
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
  }, [currentRobot?.robot_id, detachFirebaseListener, checkRobotBatteryLevel]); // Keep the existing dependencies


  // Load user's robots and their REALTIME location data from Firebase
  const loadRobots = useCallback(async () => {
    console.log("robotContext: loadRobots called");
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch the list of robots from the backend API
      // This endpoint MUST return at least the robot_id for each robot the user has access to.
      console.log("robotContext: Fetching robot list from backend API (/robots/all-robots)");
      const robotListFromApi = await robotService.getUserRobots();
      console.log("robotContext: Received robot list from API:", robotListFromApi);

      if (!robotListFromApi || robotListFromApi.length === 0) {
        console.log("robotContext: No robots found for the user.");
        setRobots([]);
        setLoading(false);
        return [];
      }

      // 2. Fetch realtime data for each robot from Firebase using one-time reads
      console.log(`robotContext: Fetching realtime data from Firebase for ${robotListFromApi.length} robots.`);
      const robotsWithRealtimeData = await Promise.all(robotListFromApi.map(async (robot) => {
        try {
           const realtimeRef = ref(database, `robots/${robot.robot_id}/realtime_data`);
           const controlRef = ref(database, `robots/${robot.robot_id}/control`); // Also fetch control data
           const realtimeSnapshot = await get(realtimeRef); // Use 'get' for a single fetch
           const controlSnapshot = await get(controlRef); // Fetch control data too

           const realtimeData = realtimeSnapshot.exists() ? realtimeSnapshot.val() : {};
           const controlData = controlSnapshot.exists() ? controlSnapshot.val() : {};

           console.log(`robotContext: Fetched realtime data for ${robot.robot_id}:`, realtimeData ? 'Data found' : 'No data');
           console.log(`robotContext: Fetched control data for ${robot.robot_id}:`, controlData ? 'Data found' : 'No data');


           // Combine static data (from API) with realtime/control data (from Firebase)
           const combinedRobot = {
             ...robot, // Static data from API
             realtime: realtimeData || {}, // Realtime data from Firebase
             control: controlData || {} // Control data from Firebase
           };
           checkRobotBatteryLevel(combinedRobot); // Check battery for each robot on load
           return combinedRobot;

        } catch (firebaseError) {
           console.error(`robotContext: Failed to fetch realtime data for robot ${robot.robot_id} from Firebase:`, firebaseError);
           // Return the robot with empty realtime data if Firebase fetch fails
           return { ...robot, realtime: {}, control: {}, fetchError: firebaseError.message || 'Firebase fetch failed' };
        }
      }));

      console.log("robotContext: Finished fetching all realtime data. Setting robots state.");
      setRobots(robotsWithRealtimeData.filter(robot => !robot.fetchError)); // Optionally filter out robots with fetch errors
      // If you want to keep robots with fetch errors in the list but without realtime data:
      // setRobots(robotsWithRealtimeData);


      return robotsWithRealtimeData;

    } catch (apiError) {
      console.error("");
      setError(apiError.message || "Failed to load robots list from API");
      setRobots([]); // Clear robots on API error
      return [];
    } finally {
      setLoading(false);
    }
  }, [checkRobotBatteryLevel, setError]); // Depend on checkRobotBatteryLevel and setError


  // Create a new robot
  const addRobot = async (robotData) => {
    try {
      setLoading(true);
      setError(null);
      const newRobot = await robotService.createRobot(robotData);
      // After creation, refresh the *entire* robot list, which will now include the new robot
      // and refetch its realtime data from Firebase in the modified loadRobots
      await loadRobots();
      // Check battery for the new robot after it's loaded into the state
      const addedRobotInState = robots.find(r => r.robot_id === newRobot.robot_id);
      if(addedRobotInState) checkRobotBatteryLevel(addedRobotInState);

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
      // Instead of manually updating the list, just reload it
      await loadRobots();
      // Find the updated robot in the new state to check battery
       const updatedRobotInState = robots.find(r => r.robot_id === robotId);
       if(updatedRobotInState) checkRobotBatteryLevel(updatedRobotInState);

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
      // Reload the list after deletion
      await loadRobots();
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

  // Get a specific robot (modified to use Firebase listener)
  const getRobot = useCallback(async (robotId) => {
    if(!robotId){
      console.warn("getRobot: robotId is missing");
      setCurrentRobot(null);
      setError("No robot ID provided.");
      setRealtimeLoading(false);
      detachFirebaseListener(); // Ensure listeners are off if robotId is null
      return null;
    }
    // Detach any previous listeners before setting a new current robot
    detachFirebaseListener();

    console.log(`Fetching STATIC data for robot: ${robotId} from API`);
    setLoading(true);
    setRealtimeLoading(true); // Set this true while attempting both static & realtime initial fetch
    clearError();
    try {
      // 1. Fetch static data from the API first (optional, depends on your API endpoint)
      // If your /robots/{robotId} endpoint returns ALL data including realtime, you can skip step 2 here.
      // Let's assume your API returns basic static data and we'll fetch realtime separately for initial state.
      const robotStaticData = await robotService.getRobot(robotId); // This hits /robots/{robotId} API

      if (!robotStaticData){
        console.warn(`getRobot service returned no static data for ${robotId}`);
        setCurrentRobot(null);
        setError("Robot not found or access denied via API.");
        setLoading(false);
        setRealtimeLoading(false);
        return null;
      }
      console.log(`Static data received for ${robotId}. Attempting initial Firebase fetch.`);

      // 2. Fetch initial realtime/control data from Firebase (one-time read)
       try {
           const realtimeRef = ref(database, `robots/${robotId}/realtime_data`);
           const controlRef = ref(database, `robots/${robotId}/control`);
           const realtimeSnapshot = await get(realtimeRef); // Use 'get'
           const controlSnapshot = await get(controlRef); // Use 'get'

           const realtimeData = realtimeSnapshot.exists() ? realtimeSnapshot.val() : {};
           const controlData = controlSnapshot.exists() ? controlSnapshot.val() : {};

           const combinedRobotData = {
             ...robotStaticData, // Use static data from API
             realtime: realtimeData || {}, // Initial realtime data from Firebase
             control: controlData || {} // Initial control data from Firebase
           };

           console.log(`Initial Firebase data fetched for ${robotId}. Setting current robot.`);
           setCurrentRobot(combinedRobotData);
           checkRobotBatteryLevel(combinedRobotData); // Check battery immediately

           // Listeners will be set up by the useEffect hook based on currentRobot

       } catch (firebaseFetchError) {
           console.error(`Error fetching initial Firebase data for ${robotId}:`, firebaseFetchError);
           // Set current robot with static data but indicate realtime data failed to load
           setCurrentRobot({ ...robotStaticData, realtime: {}, control: {}, realtimeFetchError: firebaseFetchError.message });
           setError(`Failed to load initial real-time data: ${firebaseFetchError.message}`);
       } finally {
            setLoading(false); // Static data fetch finished
            setRealtimeLoading(false); // Initial realtime fetch finished
       }

      return robotStaticData; // Return the static data object

    } catch (apiError) {
      console.error("Error getting robot static data from API:", apiError);
      setCurrentRobot(null);
      const detail = apiError.detail || apiError.message || "Failed to load robot details from API";
      // Handle specific API errors
      if (typeof detail ==="string" && detail.includes("pending approval")){
        setError("Your access request is pending approval.");
      } else if (apiError.status === 404) {
        setError("Robot not found or access denied via API.");
      } else {
        setError(detail);
      }
      setLoading(false);
      setRealtimeLoading(false); // If static API fetch fails, no realtime fetch happens
      detachFirebaseListener(); // Ensure listeners are off on API error
      return null;
    }
  },[detachFirebaseListener, clearError, checkRobotBatteryLevel]); // Add checkRobotBatteryLevel dependency

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
      await loadRobots(); // Reload the list of robots
      if(currentRobot?.robot_id === robotId) await getRobot(robotId); // Refresh details for the current robot if it was the one approved

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
      await loadRobots(); // Optionally reload robots to see if robot appears in the list (as pending)

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
      // Reload the list as access might change
      await loadRobots();
      if(currentRobot?.robot_id === robotId) await getRobot(robotId);


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
    await loadRobots(); // Also refresh the robot list
    if(currentRobot?.robot_id) {
      await getRobot(currentRobot.robot_id); // Refresh current robot details if one is selected
      await loadControlHistory(currentRobot.robot_id, false); // Refresh history if on robot detail
    }
    await loadPendingAccessRequests(); // Refresh pending requests
  }, [refreshNotifications, loadRobots, getRobot, currentRobot?.robot_id, loadControlHistory, loadPendingAccessRequests]);


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
      // Command sent successfully. The Firebase listener on /control will update the UI.
      // No need to setCommandLoading(false) immediately if you want to wait for the Firebase update,
      // but setting it here reflects that the API call finished.
      setCommandLoading(false);
      return true;
    }catch (err){
      console.error("Error in sendRobotCommand context:", err);
      const errorMessage = err.message || "Failed to send command.";
      setError(errorMessage); // Set general error state
      success = false
      return false;
    } finally {
       // You could also setCommandLoading(false) here regardless of success/failure
       // setCommandLoading(false);
    }
  }, [setError]);

  const acquireRobotControl = useCallback(async (robotId) =>{
    if (!robotId){
      setError("Cannot acquire control: No robot selected.");
      return false;
    }
    setLoading(true); // Use general loading, or add controlAcquireLoading
    setError(null);
    try{
      await robotService.acquireControl(robotId);
      // Acquisition success. Firebase listener on /control will update state.
      setLoading(false); // Assuming control acquisition API is quick
      return true;
    }catch (err){
      console.error("Error acquiring control:", err);
      const errorMessage = err.message || "Failed to acquire control.";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);

  const releaseRobotControl = useCallback(async (robotId) =>{
    if (!robotId){
      setError("Cannot release control: No robot selected.");
      return false;
    }
    setLoading(true); // Use general loading, or add controlReleaseLoading
    setError(null);
    try{
      await robotService.releaseControl(robotId);
      // Release success. Firebase listener on /control will update state.
      setLoading(false); // Assuming control release API is quick
      return true;
    }catch (err){
      console.error("Error releasing control:", err);
      const errorMessage = err.message || "Failed to release control.";
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, []);


  // Load robots and pending requests on mount
  useEffect(() => {
    console.log("RobotProvider mounted - initial data load");
    loadRobots(); // Load initial list for Home/Map screens
    loadPendingAccessRequests(); // Load initial pending requests
  }, [loadRobots, loadPendingAccessRequests]); // Dependencies ensure this runs only on mount (or if deps change, which they shouldn't)


  // Effect to check battery for robots whenever the list is loaded
   useEffect(() => {
       if (robots && robots.length > 0) {
           console.log("Robots list updated, checking battery levels...");
           robots.forEach(robot => checkRobotBatteryLevel(robot));
       }
   }, [robots, checkRobotBatteryLevel]);


  // Provide context values
  return (
    <RobotContext.Provider
      value={{
        robots,
        currentRobot,
        loading, // General loading (API fetch, add/update/delete)
        realtimeLoading, // Loading state for Firebase realtime data
        commandLoading, // Loading state specifically for sending control commands
        error, // General API error or initial Firebase connection error
        realtimeError, // Dedicated error for Firebase realtime data connection/permission
        controlError, // Dedicated error for Firebase control data connection/permission
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
        loadRobots, // Function to reload the main list (now includes Firebase fetch)
        addRobot,
        updateRobot,
        deleteRobot,
        getRobot, // Function to load/listen to a single robot (Firebase listener)
        setCurrentRobot,
        recordRobotAccess,
        requestRobotAccess,
        approveRobotAccess,
        denyRobotAccess,
        loadPendingAccessRequests,
        refreshAllData, // Combined refresh function
        sendRobotCommand,
        acquireRobotControl,
        releaseRobotControl,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};