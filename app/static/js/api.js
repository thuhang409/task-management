apiKey = "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"

var apiService = {

    // Task 
    getTask: async function(taskId){
        try {
            const response = await fetch(`/api/task/${taskId}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("failed to get task:", error);
        }},
  
    putTask: async function(taskId, newData){
        try {
            const response = await fetch(`api/task/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData),
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Error update task:", error);
            alert("Failed to update task.");
        }},

    postTask: async function(TaskData){
        try {
            let response = await fetch("api/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(TaskData)
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Error saving task:", error);
    }
    },

    deleteTask: async function(taskId){
        try {
            const response = await fetch(`api/task/${taskId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Error deleting task");
            throw error
        }
    },

    // GroupTask
    getAllGroupTasks: async function(){
        try {
            const response = await fetch("/api/group-tasks");
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("failed to get all group task:", error);
        }
    },

    getGroupTask: async function(){
       
    },

    putGroupTask: async function(group_id, updateData){
        try {
            const response = await fetch(`api/group_task/${group_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData),
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to update group task:", error);
        }
    },

    postGroupTask: async function(GroupTaskData){
        try {
            let response = await fetch("api/group-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(GroupTaskData)
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to create group task:", error);
        }
    },

    deleteGroupTask: async function(){

    },

    // Category
    getAllCategories: async function(){
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error){
            console.error("Failed to get all categories")
        }
    },

    getCategory: async function(categoryName){
        try {
            const response = await fetch(`api/category?name=${categoryName}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error){
            console.error("Failed to get all categories")
        }
    },

    putCategory: async function(){

    },

    postCategory: async function(newData){
        try{
            const response = await fetch(`api/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newData)
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch(error) {
            console.error("Failed to get category");
        }
    },

    deleteCategory: async function(){

    },

    // OpenAI API calling
    classifyTask: async function(task){
        prompt = `
        Extract the task and classify its category as one of the following:
                                
        - Personal: Related to self-care, hobbies, or personal errands.  
        - Work: Related to job, study, or professional responsibilities.  
        - Social: Related to communication, events, or social interactions.  
        - Other: Does not fit the above categories.  
        
        Return a JSON object with:  
        - **task**: The core action of the task.  
        - **category**: The appropriate category.  
        - **description**: The full original input.  
                                
        If no clear task is detected, return the full sentence as the task name.
                                
        ### Examples ###
        "Buy groceries for the weekend" → {"task": "Buy groceries", "category": "Personal", "description": "Buy groceries for the weekend"}
        "Prepare the monthly sales report" → {"task": "Prepare sales report", "category": "Work", "description": "Prepare the monthly sales report"}
        "Call John to confirm dinner plans" → {"task": "Call John", "category": "Social", "description": "Call John to confirm dinner plans"}
        "Watch a documentary about space" -> {"task": "Watch documentary", "category": "Other", "description": "Watch a documentary about space"}

        Now classify: "${task}"
        Return JSON only.
        `
        console.log(task)
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a chatbot that converts natural language input into a structured to-do list." },
                        { role: "user", content: prompt}
                    ],
                })
            });
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const result = await response.json();
        console.log("result", result);
        return result
        } catch(error) {
            console.error("Error when calling API", error);
        }
    }
}

