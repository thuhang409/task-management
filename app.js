let taskCounter = 0;

$(document).ready(function () {
    // Delete todo
    $(".list-group").on("click", ".delete", function () {
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
    })

});

function updateTaskCounter() {
    $(".col").each(function () {
        let taskCount = $(this).find(".list-group-item").not(".filtered").length; 
        console.log(taskCount)
        $(this).find(".task-count").text(taskCount);
    });
}


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
                console.log(response);
                let reply = response.choices[0].message.content;
                try {
                    let taskData = JSON.parse(reply);
                    console.log(taskData);
                    
                    resolve(taskData);
                } catch (error) {
                    console.error("Error parsing response:", error);
                    reject("API request failed")
                }
            },
            error: function () {
                // $("#result").text("Lỗi khi gọi API!");
                badgeElement.text("undefined");
                console.log("Got an error.")
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

    $(".left, .center, .right").on("dragover", function (e) {
        e.preventDefault();
    });
    
    $(".left, .center, .right").on("drop", function (e) {
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
    $(".col").on("click", async function (event) {
        event.preventDefault();

        inputTaskElement = $(this).find(".input-new-task")
        let newTodo = inputTaskElement.val().trim();
        
        if (newTodo !== "") {
            let inputData = await processTask(newTodo);
            console.log("input data", inputData)
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