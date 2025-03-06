document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("current-date").textContent = new Date().toLocaleDateString("en-GB", {
        day: "2-digit", month: "short",
    });

    renderTasks();
});

function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let registerError = document.getElementById("register-error");
    let registerSuccess = document.getElementById("register-success");

    registerError.style.display = "none";
    registerSuccess.style.display = "none";

    if (users[username]) {
        registerError.innerText = "Username already exists!";
        registerError.style.display = "block";
        return;
    }

    users[username] = { password, tasks: [] };
    localStorage.setItem("users", JSON.stringify(users));
    registerSuccess.innerText = "Registration successful. Please login.";
    registerSuccess.style.display = "block";
}
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let loginError = document.getElementById("login-error");

    loginError.style.display = "none";

    if (users[username] && users[username].password === password) {
        localStorage.setItem("loggedInUser", username);
        showApp();
    } else {
        loginError.innerText = "Incorrect username or password.";
        loginError.style.display = "block";
    }
}

function showPage(pageId, element) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    document.querySelectorAll(".bottom-nav button").forEach(button => button.classList.remove("active"));
    element.classList.add("active");

    const pageTitles = {
        "home": "Home",
        "todo": "To-do",
        "habits": "Habits",
        "events": "Events"
    };
    document.getElementById("header-title").textContent = pageTitles[pageId] || "Home";
}

function showApp() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
    document.getElementById("welcome-message").innerText = "Welcome back, " + localStorage.getItem("loggedInUser");
}

/* ✅ Fix Task Modal Not Showing on Login */
function openTaskModal() {
    document.getElementById("task-modal").style.display = "block";
}

function closeTaskModal() {
    document.getElementById("task-modal").style.display = "none";
}
function saveTask() {
    let title = document.getElementById("task-title").value;
    let desc = document.getElementById("task-desc").value;
    let time = document.getElementById("task-time").value;
    let category = document.getElementById("task-category").value;
    let deadline = document.getElementById("task-deadline").value;
    
    if (!title) {
        alert("Please enter a task title.");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ title, description: desc, estimatedTime: time, category, deadline, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));

    closeTaskModal();
    renderTasks();
}

function renderTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let todoList = document.getElementById("todo-list");
    let completedList = document.getElementById("completed-list");
    todoList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.textContent = task.title;
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleTask(index));
        li.appendChild(checkbox);
        task.completed ? completedList.appendChild(li) : todoList.appendChild(li);
    });
}
