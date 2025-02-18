let taskCounter = 0;

$(document).ready(function () {
    // Delete todo
    $(".groups").on("click", ".delete", function () {
        $(this).closest("li").remove();
        updateTaskCounter();
    });

    // Add a new to do
    addTask();

    // Edit task
    $(".list-group").on("dblclick", ".taskText", function(){
        console.log('dblclick');
        let currentText = $(this).text()
        let inputField = $('<input class="form-control m-auto" type="text" name="add" id="new-completed"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", function(e) {
            if ((e.type==="blur") || (e.key === "Enter")) {
                let newText = $(this).val();
                $(this).replaceWith(`<div class="fw-bold taskText">${newText}</div>`);
            }
        })
    })


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
    $(".groups").on("click", ".new-group", async function(event) {
        event.preventDefault();

        inputGroupElement = $(this).find("#input-new-group");
        let newGroup = inputGroupElement.val().trim();
        
        if (newGroup==="") {return };

        console.log(newGroup);
        let newGroupElement = `<div class="col group">
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

    // Edit group name
    $(document).on("dblclick", ".group-name", function(){
        console.log('dblclick');
        let currentText = $(this).text()
        let inputField = $('<input class="m-auto" type="text" name="add"/>');
        inputField.val(currentText)
        $(this).replaceWith(inputField);
        inputField.focus()

        inputField.on("blur keypress", function(e) {
            if ((e.type==="blur") || (e.key === "Enter")) {
                let newText = $(this).val();
                $(this).replaceWith(`<span class="group-name">${newText}</span>`);
            }
        })
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

    $(item).attr("id", `task-${taskCounter++}`); // Unique ID for each task

    item.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", item.id);
    });
}

function enableDragAndDrop() {
    $(".list-group-item").each(function() {
        enableDragAndDropItem(this);
    })

    $(".groups").on("dragover",".group", function (e) {
        e.preventDefault();
    });
    
    $(".groups").on("drop",".group", function (e) {
        e.preventDefault();
        let taskId = e.originalEvent.dataTransfer.getData("text/plain");
        let taskElement = document.getElementById(taskId);
        if (taskElement) {
            $(this).find('ul').append(taskElement);
        }
        updateTaskCounter();
    })   
}

function addTask() {
    $(".groups").on("click", ".group", async function (event) {
        event.preventDefault();

        inputTaskElement = $(this).find(".input-new-task")
        let newTodo = inputTaskElement.val().trim();
        
        if (newTodo !== "") {
            let inputData = await processTask(newTodo);
            // console.log("input data", inputData)
            taskItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true">
                <div class="ms-2 me-auto">
                    <div class="fw-bold taskText">${inputData.task}</div>
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