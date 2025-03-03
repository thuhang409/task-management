var apiService = {

    // Task 
    getTask: async function(taskId) {
        try {
            const response = await fetch(`/api/task/${taskId}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("failed to get task:", error);
        }
    },

    putTask: async function(taskId, newData) {
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
        }
    },

    postTask: async function(TaskData) {
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

    deleteTask: async function(taskId) {
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
    getAllGroupTasks: async function() {
        try {
            const response = await fetch("/api/group-tasks");
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("failed to get all group task:", error);
        }
    },

    getGroupTask: async function(groupId) {
        try {
            const response = await fetch(`api/group_task/${groupId}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to get group task:", error);
            throw error;
        }
    },

    putGroupTask: async function(group_id, updateData) {
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

    postGroupTask: async function(GroupTaskData) {
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

    deleteGroupTask: async function(gtaskId) {
        try {
            const response = await fetch(`api/group_task/${gtaskId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to delete group task:", error);
            alert("Error deleting group task");
            throw error
        }
    },

    // Category
    getAllCategories: async function() {
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to get all categories")
            return null
        }
    },

    getCategory: async function(categoryName) {
        try {
            const response = await fetch(`api/category?name=${categoryName}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to get this category")
        }
    },

    putCategory: async function() {

    },

    postCategory: async function(newData) {
        try {
            const response = await fetch(`api/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newData)
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Failed to update category");
        }
    },

    deleteCategory: async function() {

    },

    // OpenAI API calling
    classifyTask: async function(task) {

        console.log(task)
        try {
            const response = await fetch('/api/classify-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task: task
                })
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const result = await response.json();
            console.log("result", result);
            return result
        } catch (error) {
            console.error("Error when calling API", error);
        }
    }
}