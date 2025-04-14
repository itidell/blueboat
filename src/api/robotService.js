import apiClient from "./api";

export const robotService = {
    createRobot: async (robotData) => {
        try{
            const response = await apiClient.post('/robots/create', robotData);
            return response.data;
        }catch (error){
            console.error("Robot creation error:", error.response?.data || error);
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
    }

};