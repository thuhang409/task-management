$(document).ready(function () {

    // Delete todo
    $(".list-group").on("click", ".delete", function () {
        $(this).closest("li").remove();
    });

    // Add a new to do
    addTask(".btn", "#new-todo", ".todos");
    addTask(".btn", "#new-doing", ".doing");
    addTask(".btn", "#new-completed", ".completed");

    // Search todo
    $(".search input").on("keyup", function () {
        let searchText = $(this).val().toLowerCase();
        $(".list-group li").each(function () {
            let itemText = $(this).text().toLowerCase();
            if (!itemText.includes(searchText)) {
                $(this).addClass("filtered");
            }
            else { $(this).removeClass("filtered"); }
        });
    });

    // Check and uncheck
    $(".list-group").on("click", "li", function () {
        $(this).toggleClass("checked");
    });

});


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

function addTask(button_id, inputText_id, group_name) {
    $(button_id).click(function (event) {
        event.preventDefault();
        let newTodo = $(inputText_id).val().trim();
        if (newTodo !== "") {
            let todoItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center" draggable="true">
                <div class="ms-2 me-auto">
                    <div class="fw-bold todoText">${newTodo}</div>
                    <span class="badge rounded-pill bg-primary categories"></span>
                </div>
                <span class="far fa-edit-alt edit"></span>
                <span class="far fa-trash-alt delete"></span>
            </li>`);
            $(group_name).append(todoItem);
            $(inputText_id).val("");
            // Categorize
            categorizeTask(newTodo, todoItem.find(".categories"))

            // Add dragstart 
            todoItem.on("dragstart", function (e) {
                let selected = e.target;
                $(".left").on("dragover", function (e) {
                    e.preventDefault();
                });
                $(".left").on("drop", function (e) {
                    let ul = $(".left ul");
                    ul.append(selected);
                    selected = null;
                });

                $(".center").on("dragover", function (e) {
                    e.preventDefault();
                });
                $(".center").on("drop", function (e) {
                    let ul = $(".center ul");
                    ul.append(selected);
                    selected = null;
                });

                $(".right").on("dragover", function (e) {
                    e.preventDefault();
                });
                $(".right").on("drop", function (e) {
                    let ul = $(".right ul");
                    ul.append(selected);
                    selected = null;
                });
            });
        }
    })
}