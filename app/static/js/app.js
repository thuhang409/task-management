let taskCounter = 0;

$(document).ready(function () {
    var userElement = document.getElementById("current-user");
    if (userElement){    
        var currentUser = {
        id: userElement.getAttribute("data-id"),
        username: userElement.getAttribute("data-username")
    };
    console.log("Current User:", currentUser);
    }

    // Delete todo
    $(".groups").on("click", ".delete", async function () {

        const taskId = $(this).closest("li").attr("data-id"); 
        console.log(taskId)
        
        try {
            const response = await fetch(`api/task/${taskId}`, { method: 'DELETE' });
    
            if (response.ok) {
                $(this).closest("li").remove();
                updateTaskCounter();
            } else {
                alert("Error deleting task");
                console.log(response)
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("Error deleting task");
        }

    });
    

    // Add a new to do
    addTask();

    // Edit task
    editTaskName()

    // Search todo
    $(".search input").on("keyup", function () {
        let searchText = $(this).val().toLowerCase();
        $(".list-group li").each(function () {
            let itemText = $(this).text().toLowerCase();
            $(this).toggleClass("filtered",!itemText.includes(searchText));
            updateTaskCounter();
        });
    });

    // Check and uncheck
    $(".list-group").on("click", "li", function () {
        $(this).toggleClass("checked");
    });
    
    // Drag and drop
    enableDragAndDrop();

    // Count task
    updateTaskCounter();
    
    // Display the conversation
    $("#btn-send").on("click", function(e) {
        e.preventDefault();
        messageText = $("input.message")
        $(".conversation").append(`<div>You: ${messageText.val()}</div>`)
        messageText.val("")
    });

    // Add new group
    addGroupTask(currentUser);

    // Edit group name
    editGroupName();

    $(".list-group-item button[data-bs-toggle='modal']").on("click", function () {
        // Find the closest task item and get the task name
        var taskName = $(this).closest(".list-group-item").find(".taskText").text().trim();
        
        // Set the task name in the modal input field
        $("#task-name").val(taskName);
    });

});

function updateTaskCounter() {
    $(".col").each(function () {
        let taskCount = $(this).find(".list-group-item").not(".filtered").length; 
        $(this).find(".task-count").text(taskCount);
    });
}


const apiKey = "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"

// const apiKey = "";

function processTask(task) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://api.openai.com/v1/chat/completions",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            data: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a chatbot that converts natural language input into a structured to-do list." },
                    { role: "user", content: `Extract the task, classify its status (To Do, Doing, Done), categorical (Personal, Work, Social, Other) from this sentence: "${task}". Return the response in JSON format.` }
                ],
            }),
            success: function (response) {
                // console.log(response);
                let reply = response.choices[0].message.content;
                try {
                    let taskData = JSON.parse(reply);

                    // Ensure required fields exist, or set defaults
                    taskData.task = taskData.task || task;
                    taskData.status = taskData.status || "To Do";
                    taskData.category = taskData.category || "undefined";

                    // console.log(taskData);
                    resolve(taskData);
                } catch (error) {
                    let errorData = {
                        "task": task,
                        "status": "To Do",
                        "category": "undefined"
                    };
                    resolve(errorData);
                    console.log("Error when parsing data");
                }
            },
            error: function () {
                let errorData = {
                    "task": task,
                    "status": "To Do",
                    "category": "undefined"
                };
                resolve(errorData);
                console.log("Error when calling API");
            }
        });
    });
}

function enableDragAndDropItem(item) {
    updateTaskCounter();


    // $(item).attr("id", `task-${taskCounter++}`); // Unique ID for each task
    item.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", $(item).attr("data-id"));
    });
}

function enableDragAndDrop() {
    $(".list-group-item").each(function() {
        enableDragAndDropItem(this);
    })

    $(".groups").on("dragover",".group", function (e) {
        e.preventDefault();
    });
    
    $(".groups").on("drop",".group", async function (e) {
        e.preventDefault();
        let taskdataId = e.originalEvent.dataTransfer.getData("text/plain");
        let taskElement = $(".list-group-item").filter(`[data-id=${taskdataId}]`)
        let new_group_id = $(this).attr("data-id")
        if (taskElement) {
            $(this).find('ul').append(taskElement);
        }
        updateTaskCounter();
        
        await updateTask(taskdataId, new_group_id);
    })   
}

async function updateTask(taskId, newGroupId) {
    try {
        const response = await fetch(`api/task/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ group_id: newGroupId }),
        });

        if (!response.ok) {
            throw new Error("Failed to move task");
        }

        const data = await response.json();
        console.log("Task moved:", data);
    } catch (error) {
        console.error("Error moving task:", error);
        alert("Failed to move task.");
    }
}

function decorateBagde(badgeElement, category) {
    switch (category) {
        case "Work":
            badgeElement.addClass("bg-primary");
            break;
        case "Personal":
            badgeElement.addClass("bg-warning text-dark");
            break;
        case "Social":
            badgeElement.addClass("bg-success");
            break;
        case "Other":
            badgeElement.addClass("bg-danger");
            break;
        default:
            badgeElement.addClass("bg-secondary");
    }
}

async function getOrCreateCategory(categoryName) {
    try {
        // Gọi API GET để kiểm tra xem Category có tồn tại không
        let response = await fetch(`api/category?name=${categoryName}`);
        if (response.ok) {
            let category = await response.json();
            return category; // Trả về category nếu tìm thấy
        } 
        
        // Nếu không tìm thấy (404), thì tạo mới Category
        if (response.status === 404) {
            response = await fetch(`api/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: categoryName })
            });

            if (!response.ok) {
                throw new Error("Không thể tạo Category");
            }

            let newCategory = await response.json();
            return newCategory;
        }

        // 3️⃣ Xử lý lỗi khác
        throw new Error("Lỗi khi gọi API");
        
    } catch (error) {
        console.error("Lỗi:", error);
        return null;
    }
}

function addTask() {
    $(".groups").on("click", ".group", async function (event) {
        event.preventDefault();

        inputTaskElement = $(this).find(".input-new-task")
        grouptask_id = $(this).attr("data-id")
        
        let newTodo = inputTaskElement.val().trim();
        
        if (newTodo !== "") {
            let inputData = await processTask(newTodo);
            console.log(inputData.category)
            category = await getOrCreateCategory(inputData.category)

            TaskData={
                name: inputData.task,
                group_id: grouptask_id,
                category_id: category.id
            }
            console.log("category", TaskData)

            // Send the task data to Flask
            try {
                let response = await fetch("api/task", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(TaskData)
                });

                let result = await response.json();
                TaskData.id = result.id
            } catch (error) {
                console.error("Error saving task:", error);
            }

            taskItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true" data-id="${TaskData.id}">
                <div class="ms-2 me-auto">
                    <div class="fw-bold taskText">${TaskData.name}</div>
                    <span class="badge rounded-pill bg-primary categories">${inputData.category}</span>
                </div>
                <span class="far fa-trash-alt delete"></span>
            </li>`);
            $(this).find('.list-group').append(taskItem);
            let badgeElement = taskItem.find(".categories");
            decorateBagde(badgeElement,inputData.category);
            inputTaskElement.val("");

            // Add dragstart 
            enableDragAndDropItem(taskItem[0])
        }
    })
}

function editTaskName() {
    $(".list-group").on("dblclick", ".taskText", function(){
        console.log('dblclick');
        let task_id = $(this).closest("li").attr("data-id")
        let currentText = $(this).text()
        let inputField = $('<input class="form-control m-auto" type="text" name="add" id="new-completed"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", async function(e) {
            if ((e.type==="blur") || (e.key === "Enter")) {
                let newText = $(this).val();
                // edit task api
                if (newText != currentText){
                    try {
                        let response = await fetch(`api/task/${task_id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({name:newText})
                        });
                    } catch (error) {
                        console.error("Error saving task:", error);
                    }
                }
                $(this).replaceWith(`<div class="fw-bold taskText">${newText}</div>`);
            }
        })
    })
}

function addGroupTask(currentUser) {
    $(".groups").on("click", ".new-group", async function(event) {
        event.preventDefault();

        inputGroupElement = $(this).find("#input-new-group");
        let newGroup = inputGroupElement.val().trim();
        
        if (newGroup==="") {return };
        
        GroupTaskData={
            name: newGroup,
            user_id: currentUser.id
        }
        
        // Send the task data to Flask
        try {
            let response = await fetch("api/group-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(GroupTaskData)
            });

            let result = await response.json();
            GroupTaskData.id = result.id
        } catch (error) {
            console.error("Error saving task:", error);
        }

        let newGroupElement = `<div class="col group"  data-id=${GroupTaskData.id}>
                            <div>
                            <span  class="group-name" >${newGroup}</span>
                            <span class="badge bg-secondary task-count"></span>
                            </div>
                            
                            <ul class="list-group todos mx-auto text-light">
                            </ul>
                        
                            <form class="add text-center my-4">
                            <input class="form-control m-auto input-new-task" type="text" name="add" placeholder="Add new"/>
                            <br />
                            <br />
                            <button class="btn btn-secondary"  style="display: none;"></button>
                            </form>
                        </div>`;

        $(this).before(newGroupElement);
        inputGroupElement.val("");
        updateTaskCounter();
    });
}

function editGroupName(){
    $(document).on("dblclick", ".group-name", function(){
        console.log('dblclick');
        let group_id = $(this).closest('.group').attr("data-id")
        let currentText = $(this).text()
        let inputField = $('<input class="m-auto" type="text" name="add"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", async function(e) {
            if ((e.type==="blur") || (e.key === "Enter")) {
                console.log("out")
                let newText = $(this).val();
                if (newText != currentText){
                    console.log("hmm")
                    // api edit group task
                    try {
                        let response = await fetch(`api/group_task/${group_id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({name:newText}),
                        });
                        let result = await response.json();
                    } catch (error) {
                        console.error("Error saving task:", error);
                    }
                }
                $(this).replaceWith(`<span class="group-name">${newText}</span>`);

            }
        })
    });
}
// function openForm() {
//     document.getElementById("myForm").style.display = "block";
//   }
  
// function closeForm() {
//     document.getElementById("myForm").style.display = "none";
// }

// function checkScrollable() {
//     let groupCount = $(".groups .group").length;
//     if (groupCount > 3) {
//         $(".groups-container").css("overflow-x", "auto");
//     } else {
//         $(".groups-container").css("overflow-x", "hidden");
//     }
// }

// // Call this function when a new group is added
// $(".groups").on("click", ".new-group", function () {
//     setTimeout(checkScrollable, 100); // Wait for the new group to render
// });

// // Also check on page load
// $(document).ready(checkScrollable);