const URL = "https://demo2.z-bit.ee"
const TOKEN = "595l6dZUOHh2qqyKPZVpViLz11pabKWF"

document.addEventListener("DOMContentLoaded", () => {
    taskList = document.querySelector("#task-list");
    addTask = document.querySelector("#add-task");

    readTasks();

    addTask.addEventListener("click", async () => {
        try {
            const task = await createTask();
            const taskRow = createTaskRow({
                id: task.id,
                name: task.title,
                completed: task.marked_as_done ?? false,
            });
            taskList.appendChild(taskRow);
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task");
        }
    });
});

async function createTask() {
    const res = await fetch(`${URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            title: "Task",
            desc: "Description",
        }),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const data = await res.json();
    console.log("Task created:", data);
    return data;
}

async function readTasks() {
    try {
        const response = await fetch(`${URL}/tasks`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Tasks read:", data);

        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }

        data.forEach((task) => {
            const taskRow = createTaskRow({
                id: task.id,
                name: task.title,
                completed: task.marked_as_done ?? false,
            });
            taskList.appendChild(taskRow);
        });
    } catch (error) {
        console.error("Error reading tasks:", error);
        alert("Failed to load tasks");
    }
}

async function updateTask(taskId, updatedTask) {
    try {
        const response = await fetch(`${URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Task updated:", data);
    } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update tasks");
    }
}

async function deleteTask(taskId, taskRow) {
    try {
        const response = await fetch(`${URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        if (!response.ok) throw new Error("Failed to delete task");
        console.log("Task deleted");
        taskList.removeChild(taskRow);
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete tasks");
    }
}

function updateAntCheckboxVisual(input) {
	const checkbox = input.closest(".ant-checkbox");
	if (!checkbox) return;
	if (input.checked) {
		checkbox.classList.add("ant-checkbox-checked");
	} else {
		checkbox.classList.remove("ant-checkbox-checked");
	}
}

function createTaskRow(task) {
    const template = document.querySelector('[data-template="task-row"]');
    const taskRow = template.cloneNode(true);
    taskRow.removeAttribute("data-template");

    const nameInput = taskRow.querySelector("[name='name']");
    nameInput.value = task.name;

    nameInput.addEventListener("blur", async () => {
        const newTitle = nameInput.value.trim();
        if (newTitle === task.name) return;

        try {
            await updateTask(task.id, { title: newTitle });
            task.name = newTitle;
        } catch {
            alert("Failed to update task title");
        }
    });

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.completed;
    updateAntCheckboxVisual(checkbox);

    checkbox.addEventListener("change", async () => {
        checkbox.disabled = true;
        try {
            await updateTask(task.id, { marked_as_done: checkbox.checked });
            task.completed = checkbox.checked;
            updateAntCheckboxVisual(checkbox);
        } catch {
            alert("Failed to update task status");
            checkbox.checked = task.completed;
            updateAntCheckboxVisual(checkbox);
        } finally {
            checkbox.disabled = false;
        }
    });


    const deleteButton = taskRow.querySelector(".delete-task");
    deleteButton.addEventListener("click", () => {
        deleteTask(task.id, taskRow);
    });

    return taskRow;
}