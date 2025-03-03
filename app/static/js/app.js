$(document).ready(function() {


    // Delete task
    deleteTask();

    // Add a new task
    addTask();

    // Edit task name
    editTaskName();

    // Edit Task
    editTask();

    // Search task
    $(".search input").on("keyup", function() {
        let searchText = $(this).val().toLowerCase();
        $(".list-group li").each(function() {
            let itemText = $(this).text().toLowerCase();
            $(this).toggleClass("filtered", !itemText.includes(searchText));
            updateTaskCounter();
        });
    });

    // Drag and drop
    enableDragAndDrop();

    // Count task
    updateTaskCounter();

    // Add new group
    addGroupTask();

    // Edit group name
    editGroupName();

    // Delete group task
    deleteGroupTask();

    // Badge Color
    decorateBagde();

});

function confirmDeleteGroup(groupId) {
    return new Promise((resolve) => {
        if (confirm("Are you sure you want to delete this group and all its tasks?")) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

async function deleteGroupTask() {
    $(document).on("click", ".delete-group", async function() {
        const group_element = $(this).closest(".group");
        const group_id = group_element.data("id");

        if (!group_id) return;

        // Check if group has any tasks
        const tasks = group_element.find(".list-group li");
        if (tasks.length > 0) {
            // Ask for confirmation if there are tasks
            const confirmed = await confirmDeleteGroup();
            if (!confirmed) {
                return;
            }
        }

        const response = await apiService.deleteGroupTask(group_id);
        if (response) {
            group_element.remove();
            console.log(`Deleted GroupTask ID: ${group_id}`);
        }
    });
}


function deleteTask() {
    $(".groups").on("click", ".delete", async function() {

        const taskId = $(this).closest("li").attr("data-id");
        console.log(taskId)

        response = await apiService.deleteTask(taskId);

        if (response) {
            $(this).closest("li").remove();
            updateTaskCounter();
        }

    });
}

function editTask() {
    $(document).on("click", ".list-group-item span[data-bs-toggle='modal']", async function() {
        let taskId = $(this).closest(".list-group-item").attr("data-id");
        console.log("taskId:", taskId); // Debugging

        const data = await apiService.getTask(taskId);
        console.log("Fetched Data:", data); // Debugging

        if (data) {
            $("#task-name").val(data.name);
            fetchCategories(data.category_id);
            fetchStatus(data.group_id);
            $("#ControlTextarea1").val(data.description);

            // Prevent duplicate event listeners
            $(document).off("click", "#edit-task-button").on("click", "#edit-task-button", async function() {
                const task_name = $("#task-name").val().trim();
                const categoryId = $("#inputGroupSelect01").val();
                const groupId = $("#inputGroupSelect02").val();
                const description = $("#ControlTextarea1").val();

                console.log("Updating task:", { task_name, categoryId, groupId, description });

                const response = await apiService.putTask(taskId, {
                    name: task_name,
                    category_id: categoryId,
                    group_id: groupId,
                    description: description
                });

                console.log("Update Response:", response);

                if (response) {
                    $("#exampleModal").modal("hide");
                    setTimeout(() => location.reload(), 10);
                }
            });
        }
    });
}


async function fetchStatus(choose_id) {
    try {
        const data = await apiService.getAllGroupTasks();
        const categorySelect = document.getElementById("inputGroupSelect02");
        categorySelect.innerHTML = ""; // Clear existing options
        data.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        categorySelect.value = choose_id;

    } catch (error) {
        console.error("Error fetching task group:", error);
    }
}

async function fetchCategories(choose_id) {
    try {
        const data = await apiService.getAllCategories();
        const categorySelect = document.getElementById("inputGroupSelect01");
        categorySelect.innerHTML = ""; // Clear existing options
        data.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        categorySelect.value = choose_id;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

function updateTaskCounter() {
    $(".col").each(function() {
        let taskCount = $(this).find(".list-group-item").not(".filtered").length;
        $(this).find(".task-count").text(taskCount);
    });
}

async function processTask(task) {
    const response = await apiService.classifyTask(task);
    if (response) {
        const reply = response.choices[0].message.content;
        const taskData = JSON.parse(reply);
        console.log("taskData", taskData)
        return {
            task: taskData.task || task,
            category: taskData.category || "undefined",
            description: taskData.description || ""
        }
    } else {
        return {
            task: task,
            category: "undefined",
            description: ""
        }
    }
}

function enableDragAndDropItem(item) {
    updateTaskCounter();


    // $(item).attr("id", `task-${taskCounter++}`); // Unique ID for each task
    item.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", $(item).attr("data-id"));
    });
}

function enableDragAndDrop() {
    $(".list-group-item").each(function() {
        enableDragAndDropItem(this);
    })

    $(".groups").on("dragover", ".group", function(e) {
        e.preventDefault();
    });

    $(".groups").on("drop", ".group", async function(e) {
        e.preventDefault();
        let taskdataId = e.originalEvent.dataTransfer.getData("text/plain");
        let taskElement = $(".list-group-item").filter(`[data-id=${taskdataId}]`)
        let new_group_id = $(this).attr("data-id")
        if (taskElement) {
            $(this).find('ul').append(taskElement);
        }
        updateTaskCounter();

        await apiService.putTask(taskdataId, { group_id: new_group_id });
    })
}

function getPastelColor(categoryId) {
    let hue = (parseInt(categoryId, 10) * 137) % 360; // Unique hue per ID
    return `hsl(${hue}, 30%, 50%)`; // Soft pastel color (60% saturation, 80% lightness)
}

function decorateBagde() {
    $(".categories").each(function() {
        let category = $(this).text().trim();
        let color = getPastelColor($(this).attr("data-id"));
        $(this).css({
            "background-color": color,
            "color": "white",
            "padding": "5px 10px",
            "border-radius": "5px"
        });
    });

}

async function getOrCreateCategory(categoryName) {
    try {
        const existedCate = await apiService.getCategory(categoryName);
        if (existedCate) return existedCate;

        const createdCate = await apiService.postCategory({ name: categoryName })
        if (createdCate) return createdCate;

        throw new Error("Lỗi khi gọi API");

    } catch (error) {
        console.error("Lỗi:", error);
        return null;
    }
}

function addTask() {
    $(".groups").on("click", ".group", async function(event) {
        event.preventDefault();

        inputTaskElement = $(this).find(".input-new-task")
        grouptask_id = $(this).attr("data-id")

        let newTodo = inputTaskElement.val().trim();

        if (newTodo !== "") {
            let inputData = await processTask(newTodo);
            console.log(inputData);
            category = await getOrCreateCategory(inputData.category);

            TaskData = {
                name: inputData.task,
                group_id: grouptask_id,
                category_id: category.id,
                description: inputData.description
            }

            // Send the task data to Flask
            response = await apiService.postTask(TaskData);
            if (response) {
                TaskData.id = response.id
            }

            taskItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true" data-id="${TaskData.id}">
                <div class="ms-2 me-auto">
                    <div class="fw-bold taskText">${TaskData.name}</div>
                    <span class="badge rounded-pill categories" data-id="${TaskData.category_id}">${inputData.category}</span>
                </div>
                <span class="fa-solid fa-pencil" data-bs-toggle="modal" data-bs-target="#exampleModal" style="cursor: pointer; margin-right: 5px;"></span>
                <span class="far fa-trash-alt delete"></span>
            </li>`);

            // Bagde Color
            const color = getPastelColor(taskItem.attr("data-id"));
            taskItem.find(".categories").css({
                "background-color": color,
                "color": "white",
                "padding": "5px 10px",
                "border-radius": "5px"
            });

            $(this).find('.list-group').append(taskItem);
            decorateBagde();
            inputTaskElement.val("");

            // Add dragstart 
            enableDragAndDropItem(taskItem[0])
        }
    })
}

function editTaskName() {
    $(".list-group").on("dblclick", ".taskText", function() {
        console.log('dblclick');
        let task_id = $(this).closest("li").attr("data-id")
        let currentText = $(this).text()
        let inputField = $('<input class="form-control m-auto" type="text" name="add" id="new-completed"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", async function(e) {
            if ((e.type === "blur") || (e.key === "Enter")) {
                let newText = $(this).val();
                // edit task api
                if (newText != currentText) {
                    apiService.putTask(taskId, { name: newText });
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

        if (newGroup === "") { return };

        const data = await apiService.postGroupTask({
            name: newGroup,
        })

        let newGroupElement = `<div class="col group" data-id=${data.id}>
                                <div class="group-header">
                                    <div>
                                        <span  class="group-name" >${data.name}</span>
                                        <span class="badge bg-secondary task-count"></span>
                                    </div>
                                    <i class="fa-solid fa-xmark delete-group" id="deleteGroupButton"></i>
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

function editGroupName() {
    $(document).on("dblclick", ".group-name", function() {
        console.log('dblclick');
        let group_id = $(this).closest('.group').attr("data-id")
        let currentText = $(this).text()
        let inputField = $('<input class="m-auto" type="text" name="add"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", async function(e) {
            if ((e.type === "blur") || (e.key === "Enter")) {
                console.log("out")
                let newText = $(this).val();
                if (newText != currentText) {
                    console.log("hmm")
                        // api edit group task
                    apiService.putGroupTask(group_id, { name: newText })
                }
                $(this).replaceWith(`<span class="group-name">${newText}</span>`);

            }
        })
    });
}

async function addCategory() {
    const name = $("#newCategoryInput").val().trim();
    if (!name) return alert("Enter a category name!");

    const response = await apiService.postCategory({ name: name })

    if (response) {
        $("#newCategoryInput").value = "";
        cateItem = $(`<li class="category" id="category-${response.id}">${response.name}</li>`);
        $("#categoryList").append(cateItem);
    }
}