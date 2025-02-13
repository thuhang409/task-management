let taskCounter = 0;

$(document).ready(function () {
    // Delete todo
    $(".list-group").on("click", ".delete", function () {
        $(this).closest("li").remove();
        updateTaskCounter();
    });

    // Add a new to do
    addTask("#btn-todo", "#new-todo", ".todos");
    addTask("#btn-doing", "#new-doing", ".doing");
    addTask("#btn-completed", "#new-completed", ".completed");

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
    

});

function updateTaskCounter() {
    $(".col").each(function () {
        let taskCount = $(this).find(".list-group-item").not(".filtered").length; 
        console.log(taskCount)
        $(this).find(".task-count").text(taskCount);
    });
}


const apiKey = ""
async function categorizeTask(task, badgeElement) {
    const prompt = `Phân loại nhiệm vụ sau thành một trong các danh mục: Work, Personal, Social, Other.
        \nNhiệm vụ: "${task}"
        \nDanh mục:`;

    $.ajax({
        url: "https://api.openai.com/v1/completions",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        data: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 10,
            temperature: 0
        }),
        success: function (response) {
            console.log(response);
            let category = response.choices[0].text.trim();
            badgeElement.text(category); // Hiển thị kết quả
            console.log(category);

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
        },
        error: function () {
            // $("#result").text("Lỗi khi gọi API!");
            badgeElement.text("undefined");
            console.log("Got an error.")
        }
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
        console.log("dragover")
        e.preventDefault();
    });
    
    $(".left, .center, .right").on("drop", function (e) {
        e.preventDefault();
        let taskId = e.originalEvent.dataTransfer.getData("text/plain");
        let taskElement = document.getElementById(taskId);
        console.log(taskElement)
        if (taskElement) {
            $(this).find('ul').append(taskElement);
        }
        updateTaskCounter();
    })   
}

function addTask(button_id, inputText_id, group_name) {
    $(button_id).on("click", function (event) {
        event.preventDefault();

        let newTodo = $(inputText_id).val().trim();
        
        if (newTodo !== "") {
            taskItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true">
                <div class="ms-2 me-auto">
                    <div class="fw-bold taskText">${newTodo}</div>
                    <span class="badge rounded-pill bg-primary categories"></span>
                </div>
                <span class="far fa-edit-alt edit"></span>
                <span class="far fa-trash-alt delete"></span>
            </li>`);
            $(group_name).append(taskItem);
            $(inputText_id).val("");
            // Categorize
            categorizeTask(newTodo, taskItem.find(".categories"))

            // Add dragstart 
            enableDragAndDropItem(taskItem[0])
        }
    })
}