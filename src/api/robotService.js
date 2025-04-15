import apiClient from "./api";

export const robotService = {
    createRobot: async (robotData) => {
      try{
        console.log("Attempting to create robot with data:", JSON.stringify(robotData));
        const response = await apiClient.post('/robots/create', robotData);
        return response.data;
      }catch (error){
        console.error("Robot creation error:", error.response?.status);
        console.error("Error details:", error.response?.data);
        throw error.response?.data || error;
      }
    },

    getUserRobots: async () => {
        try {
          const response = await apiClient.get('/robots/all-robots');
          return response.data;
        } catch (error) {
          console.error("Get robots error:", error.response?.data || error);
          throw error.response?.data || error;
        }
    },

    // Get a specific robot by ID
    getRobot: async (robotId) => {
        try {
            const response = await apiClient.get(`/robots/${robotId}`);
            return response.data;
        } catch (error) {
            console.error("Get robot error:", error.response?.data || error);
            throw error.response?.data || error;
        }
    },
    updateRobot: async (robotId, robotData) => {
        try {
          const response = await apiClient.put(`/robots/${robotId}`, robotData);
          return response.data;
        } catch (error) {
          console.error("Update robot error:", error.response?.data || error);
          throw error.response?.data || error;
        }
      },
    
    // Delete a robot
    deleteRobot: async (robotId) => {
        try {
          const response = await apiClient.delete(`/robots/${robotId}`);
          return response.data;
        } catch (error) {
          console.error("Delete robot error:", error.response?.data || error);
          throw error.response?.data || error;
        }
    },
    recordRobotAccess: async (robotId) =>{
      try{
        const response = await apiClient.apiClient.post(`/robots/${robotId}/access-notification`);
        return response.data;
      }catch(error){
        console.error("Record robot access error:", error.response?.data || error)
        throw error.response?.data || error;
      }
    },

    requestRobotAccess: async (robotId, ownerEmail) => {
      try {
          const response = await apiClient.post('/robots/request-access', {
            robot_id: robotId,
            owner_email: ownerEmail
          });
          return response.data;
      } catch (error) {
          console.error("Request robot access error:", error.response?.data || error);
          throw error.response?.data || error;
      }
    },

    approveRobotAccess: async (robotId, requesterId) => {
      try {
        const response = await apiClient.post(`/robots/approve-access/${robotId}/${requesterId}`);
        return response.data;
      } catch (error) {
        console.error("Approve robot access error:", error.response?.data || error);
        throw error.response?.data || error;
      }
    }

};