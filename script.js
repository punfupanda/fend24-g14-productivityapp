document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("current-date").textContent = new Date()
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    renderTasks();
    renderHabits();
    renderEvents();
    renderHomePage();
  });
  let filterStatus = "all";
  let filterCategories = [];
  let sortField = null;
  let sortOrder = "asc";
  let editingTaskId = null;
  let showCompletedTasks = false;
  
  let habitFilterPriority = "all";
  let habitSortField = null;
  let habitSortOrder = "asc";
  let editingHabitId = null;
  
  let eventFilter = "upcoming";
  let editingEventId = null;
  
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
    users[username] = { password };
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
      showTransitionScreen();
    } else {
      loginError.innerText = "Incorrect username or password.";
      loginError.style.display = "block";
    }
  }
  
  function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
  }
  function showTransitionScreen() {
    fetch("https://thequoteshub.com/api/random-quote")
      .then((response) => response.json())
      .then((data) => {
        if (data.text.length > 120) {
          data.text = data.text.substring(0, 120) + "...";
        }
        document.getElementById("transition-quote").innerText = data.text;
        document.getElementById("transition-author").innerText = "– " + data.author;
      })
      .catch((error) => {
        console.error("Error fetching quote:", error);
        document.getElementById("transition-quote").innerText = "Do or do not. There is no try.";
        document.getElementById("transition-author").innerText = "Master Yoda";
      })
      .finally(() => {
        document.getElementById("transition-screen").style.display = "flex";
        setTimeout(() => {
          document.getElementById("transition-screen").style.display = "none";
          showApp();
        }, 3500);
      });
  }
  function showApp() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "block";
  }
  
  function closeAllModals() {
    document.getElementById("task-modal").style.display = "none";
    document.getElementById("habit-modal").style.display = "none";
    document.getElementById("event-modal").style.display = "none";
    document.getElementById("task-detail-modal").style.display = "none";
  }
  function showPage(pageId, element) {
    closeAllModals();
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    document.querySelectorAll(".bottom-nav button").forEach((btn) => btn.classList.remove("active"));
    element.classList.add("active");
    const pageTitles = { home: "Home", todo: "To-do", habits: "Habits", events: "Events" };
    document.getElementById("header-title").textContent = pageTitles[pageId] || "Home";
  }
  
  function navigateTo(pageId, navId) {
    showPage(pageId, document.getElementById(navId));
  }
  function renderHomePage() {
    renderRecentTasks();
    renderTopHabits();
    renderUpcomingEvents();
  }
  
  function renderRecentTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let incomplete = tasks.filter((t) => !t.completed);
    incomplete.sort((a, b) => b.id - a.id);
    let top3 = incomplete.slice(0, 3);
    let list = document.getElementById("recent-tasks");
    list.innerHTML = "";
    top3.forEach((task) => {
      let li = document.createElement("li");
      li.textContent = task.title;
      list.appendChild(li);
    });
  }
  
  function renderTopHabits() {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    habits.sort((a, b) => b.repetitions - a.repetitions);
    let top3 = habits.slice(0, 3);
    let list = document.getElementById("top-habits");
    list.innerHTML = "";
    top3.forEach((habit) => {
      let li = document.createElement("li");
      li.textContent = `${habit.title} (${habit.repetitions})`;
      list.appendChild(li);
    });
  }
  
  function renderUpcomingEvents() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    let now = new Date();
    let upcoming = events.filter((e) => new Date(e.start) >= now);
    let top3 = upcoming.slice(0, 3);
    let list = document.getElementById("upcoming-events");
    list.innerHTML = "";
    top3.forEach((evt) => {
      let li = document.createElement("li");
      li.textContent = `${evt.name} (${evt.start})`;
      list.appendChild(li);
    });
  }
  document.getElementById("filter-btn").addEventListener("click", () => {
    const panel = document.getElementById("filter-panel");
    panel.classList.toggle("panel-hidden");
  });
  document.getElementById("sort-btn").addEventListener("click", () => {
    const panel = document.getElementById("sort-panel");
    panel.classList.toggle("panel-hidden");
  });
  
  function applyFilter() {
    filterStatus = document.getElementById("filter-status").value;
    const checkedBoxes = document.querySelectorAll("#filter-panel input[type='checkbox']:checked");
    filterCategories = Array.from(checkedBoxes).map((cb) => cb.value);
    document.getElementById("filter-panel").classList.add("panel-hidden");
    renderTasks();
  }
  
  function applySort() {
    sortField = document.getElementById("sort-field").value;
    sortOrder = document.getElementById("sort-order").value;
    document.getElementById("sort-panel").classList.add("panel-hidden");
    renderTasks();
  }
  function openTaskModal(isEditing = false) {
    if (!isEditing) {
      editingTaskId = null;
      document.getElementById("modal-title").innerText = "New Task";
      document.getElementById("task-title").value = "";
      let timeInput = document.getElementById("task-time");
      timeInput.placeholder = "HH:MM";
      timeInput.value = "";
      document.getElementById("task-category").value = "housing";
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("task-deadline").value = today;
      document.getElementById("task-desc").value = "";
    }
    document.getElementById("task-modal").style.display = "block";
  }
  function closeTaskModal() {
    document.getElementById("task-modal").style.display = "none";
  }
  function saveTask() {
    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-desc").value;
    const time = document.getElementById("task-time").value;
    const category = document.getElementById("task-category").value;
    const deadline = document.getElementById("task-deadline").value;
    if (!title) {
      alert("Please enter a task title.");
      return;
    }
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    if (!editingTaskId) {
      const newTask = {
        id: Date.now(),
        title,
        description: desc,
        estimatedTime: time,
        category,
        deadline,
        completed: false,
      };
      tasks.push(newTask);
    } else {
      const idx = tasks.findIndex((t) => t.id === editingTaskId);
      if (idx > -1) {
        tasks[idx].title = title;
        tasks[idx].description = desc;
        tasks[idx].estimatedTime = time;
        tasks[idx].category = category;
        tasks[idx].deadline = deadline;
      }
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    closeTaskModal();
    renderTasks();
    renderHomePage();
  }
  
  function renderTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let filtered = tasks.filter((task) => {
      if (filterStatus === "complete" && !task.completed) return false;
      if (filterStatus === "incomplete" && task.completed) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(task.category)) return false;
      return true;
    });
    if (sortField) {
      filtered.sort((a, b) => {
        let valA, valB;
        switch (sortField) {
          case "deadline":
            valA = a.deadline || "";
            valB = b.deadline || "";
            break;
          case "time":
            valA = a.estimatedTime || "";
            valB = b.estimatedTime || "";
            break;
          case "status":
            valA = a.completed ? 1 : 0;
            valB = b.completed ? 1 : 0;
            break;
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    let incompleteTasks = filtered.filter((t) => !t.completed);
    let completedTasks = filtered.filter((t) => t.completed);
    
    let todoList = document.getElementById("todo-list");
    let completedList = document.getElementById("completed-list");
    todoList.innerHTML = "";
    completedList.innerHTML = "";
    
    if (incompleteTasks.length === 0) {
      let p = document.createElement("p");
      p.innerHTML = `<a href="#" style="color: #007aff;" onclick="openTaskModal()">Add a new task</a>`;
      todoList.appendChild(p);
    } else {
      incompleteTasks.forEach((task) => {
        let card = createTaskCard(task);
        todoList.appendChild(card);
      });
    }
    
    completedTasks.forEach((task) => {
      let card = createTaskCard(task);
      completedList.appendChild(card);
    });
  }
  
  function createTaskCard(task) {
    let card = document.createElement("div");
    card.className = "task-card";

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "custom-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleTask(task.id);
    });
    card.appendChild(checkbox);
    
    let details = document.createElement("div");
    details.className = "details";
    let title = document.createElement("div");
    title.className = "title";
    title.textContent = task.title;
    details.appendChild(title);
    
    let meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `Time: ${task.estimatedTime || "-"} | Category: ${task.category} | Deadline: ${task.deadline || "-"}`;
    details.appendChild(meta);
    
    card.appendChild(details);
    
    let btnContainer = document.createElement("div");
    btnContainer.className = "btn-container";
    
    let editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editTask(task.id);
    });
    btnContainer.appendChild(editBtn);
    
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });
    btnContainer.appendChild(deleteBtn);
    
    card.appendChild(btnContainer);
    
    card.addEventListener("click", () => openTaskDetailModal(task));
    
    return card;
  }
  
  function openTaskDetailModal(task) {
    document.getElementById("detail-title").textContent = task.title;
    document.getElementById("detail-desc").textContent = task.description || "";
    document.getElementById("detail-time").textContent = "Estimated time: " + (task.estimatedTime || "-");
    document.getElementById("detail-category").textContent = "Category: " + task.category;
    document.getElementById("detail-deadline").textContent = "Deadline: " + (task.deadline || "-");
    document.getElementById("task-detail-modal").style.display = "block";
  }
  
  function closeTaskDetailModal() {
    document.getElementById("task-detail-modal").style.display = "none";
  }
  
  function toggleTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let idx = tasks.findIndex((t) => t.id === taskId);
    if (idx > -1) {
      tasks[idx].completed = !tasks[idx].completed;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      renderHomePage();
    }
  }
  
  function toggleCompleted() {
    showCompletedTasks = !showCompletedTasks;
    let completedList = document.getElementById("completed-list");
    let icon = document.getElementById("toggle-completed-btn").querySelector("i");
    if (showCompletedTasks) {
      completedList.style.display = "block";
      icon.classList.remove("fa-chevron-right");
      icon.classList.add("fa-chevron-down");
    } else {
      completedList.style.display = "none";
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-right");
    }
  }
  
  function editTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;
    document.getElementById("modal-title").innerText = "Edit Task";
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-time").value = task.estimatedTime || "";
    document.getElementById("task-category").value = task.category || "housing";
    document.getElementById("task-deadline").value = task.deadline || "";
    document.getElementById("task-desc").value = task.description || "";
    openTaskModal(true);
  }
  
  function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let updated = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(updated));
    renderTasks();
    renderHomePage();
  }
  
  function toggleHabitFilter() {
    document.getElementById("habit-filter-panel").classList.toggle("panel-hidden");
  }
  function toggleHabitSort() {
    document.getElementById("habit-sort-panel").classList.toggle("panel-hidden");
  }
  function applyHabitFilter() {
    habitFilterPriority = document.getElementById("habit-filter-priority").value;
    document.getElementById("habit-filter-panel").classList.add("panel-hidden");
    renderHabits();
  }
  function applyHabitSort() {
    habitSortField = document.getElementById("habit-sort-field").value;
    habitSortOrder = document.getElementById("habit-sort-order").value;
    document.getElementById("habit-sort-panel").classList.add("panel-hidden");
    renderHabits();
  }
  function openHabitModal(isEditing = false) {
    if (!isEditing) {
      editingHabitId = null;
      document.getElementById("habit-modal-title").innerText = "New Habit";
      document.getElementById("habit-title").value = "";
      document.getElementById("habit-priority").value = "";
    }
    document.getElementById("habit-modal").style.display = "block";
  }
  function closeHabitModal() {
    document.getElementById("habit-modal").style.display = "none";
  }
  function saveHabit() {
    const title = document.getElementById("habit-title").value;
    const priority = document.getElementById("habit-priority").value;
    if (!title) {
      alert("Please enter a habit title.");
      return;
    }
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    if (!editingHabitId) {
      let newHabit = {
        id: Date.now(),
        title,
        priority,
        repetitions: 0,
      };
      habits.push(newHabit);
    } else {
      let idx = habits.findIndex((h) => h.id === editingHabitId);
      if (idx > -1) {
        habits[idx].title = title;
        habits[idx].priority = priority;
      }
    }
    localStorage.setItem("habits", JSON.stringify(habits));
    closeHabitModal();
    renderHabits();
    renderHomePage();
  }
  function renderHabits() {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    if (habitFilterPriority !== "all") {
      habits = habits.filter((h) => h.priority === habitFilterPriority);
    }
    if (habitSortField) {
      habits.sort((a, b) => {
        let valA, valB;
        switch (habitSortField) {
          case "repetitions":
            valA = a.repetitions;
            valB = b.repetitions;
            break;
          case "priority":
            const prMap = { low: 1, medium: 2, high: 3 };
            valA = prMap[a.priority];
            valB = prMap[b.priority];
            break;
        }
        if (valA < valB) return habitSortOrder === "asc" ? -1 : 1;
        if (valA > valB) return habitSortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    let habitList = document.getElementById("habit-list");
    habitList.innerHTML = "";
    habits.forEach((habit) => {
      let li = document.createElement("li");
      li.textContent = `${habit.title} [${habit.priority}] - ${habit.repetitions}x`;
      let incBtn = document.createElement("button");
      incBtn.textContent = "+";
      incBtn.addEventListener("click", () => {
        habit.repetitions++;
        saveHabits(habits);
      });
      li.appendChild(incBtn);
      let decBtn = document.createElement("button");
      decBtn.textContent = "-";
      decBtn.addEventListener("click", () => {
        if (habit.repetitions > 0) {
          habit.repetitions--;
          saveHabits(habits);
        }
      });
      li.appendChild(decBtn);
      let resetBtn = document.createElement("button");
      resetBtn.textContent = "Reset";
      resetBtn.addEventListener("click", () => {
        habit.repetitions = 0;
        saveHabits(habits);
      });
      li.appendChild(resetBtn);
      let editBtn = document.createElement("button");
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
      editBtn.addEventListener("click", () => editHabit(habit.id));
      li.appendChild(editBtn);
      let delBtn = document.createElement("button");
      delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      delBtn.addEventListener("click", () => deleteHabit(habit.id));
      li.appendChild(delBtn);
      habitList.appendChild(li);
    });
  }
  function editHabit(habitId) {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    let habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    editingHabitId = habitId;
    document.getElementById("habit-modal-title").innerText = "Edit Habit";
    document.getElementById("habit-title").value = habit.title;
    document.getElementById("habit-priority").value = habit.priority;
    openHabitModal(true);
  }
  function deleteHabit(habitId) {
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    let updated = habits.filter((h) => h.id !== habitId);
    localStorage.setItem("habits", JSON.stringify(updated));
    renderHabits();
    renderHomePage();
  }
  function saveHabits(habits) {
    localStorage.setItem("habits", JSON.stringify(habits));
    renderHabits();
    renderHomePage();
  }
  

  function toggleEventFilter() {
    document.getElementById("event-filter-panel").classList.toggle("panel-hidden");
  }
  function applyEventFilter() {
    eventFilter = document.getElementById("event-filter").value;
    document.getElementById("event-filter-panel").classList.add("panel-hidden");
    renderEvents();
    renderHomePage();
  }
  function openEventModal(isEditing = false) {
    if (!isEditing) {
      editingEventId = null;
      document.getElementById("event-modal-title").innerText = "New Event";
      document.getElementById("event-name").value = "";
      document.getElementById("event-start").value = "";
      document.getElementById("event-end").value = "";
    }
    document.getElementById("event-modal").style.display = "block";
  }
  function closeEventModal() {
    document.getElementById("event-modal").style.display = "none";
  }
  function saveEvent() {
    const name = document.getElementById("event-name").value;
    const start = document.getElementById("event-start").value;
    const end = document.getElementById("event-end").value;
    if (!name || !start) {
      alert("Please enter at least the event name and start time.");
      return;
    }
    let events = JSON.parse(localStorage.getItem("events")) || [];
    if (!editingEventId) {
      let newEvt = {
        id: Date.now(),
        name,
        start,
        end,
      };
      events.push(newEvt);
    } else {
      let idx = events.findIndex((e) => e.id === editingEventId);
      if (idx > -1) {
        events[idx].name = name;
        events[idx].start = start;
        events[idx].end = end;
      }
    }
    localStorage.setItem("events", JSON.stringify(events));
    closeEventModal();
    renderEvents();
    renderHomePage();
  }
  function renderEvents() {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    let now = new Date();
    if (eventFilter === "upcoming") {
      events = events.filter((e) => new Date(e.start) >= now);
    } else if (eventFilter === "past") {
      events = events.filter((e) => new Date(e.start) < now);
    }
    let eventList = document.getElementById("event-list");
    eventList.innerHTML = "";
    events.forEach((evt) => {
      let li = document.createElement("li");
      let startDate = new Date(evt.start);
      if (startDate < now) {
        li.classList.add("past-event");
      }
      li.textContent = `${evt.name} (${evt.start} - ${evt.end || "?"}) `;
      let editBtn = document.createElement("button");
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
      editBtn.addEventListener("click", () => editEvent(evt.id));
      li.appendChild(editBtn);
      let delBtn = document.createElement("button");
      delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      delBtn.addEventListener("click", () => deleteEvent(evt.id));
      li.appendChild(delBtn);
      eventList.appendChild(li);
    });
  }
  function editEvent(eventId) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    editingEventId = eventId;
    document.getElementById("event-modal-title").innerText = "Edit Event";
    document.getElementById("event-name").value = evt.name;
    document.getElementById("event-start").value = evt.start;
    document.getElementById("event-end").value = evt.end || "";
    openEventModal(true);
  }
  function deleteEvent(eventId) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let updated = events.filter((e) => e.id !== eventId);
    localStorage.setItem("events", JSON.stringify(updated));
    renderEvents();
    renderHomePage();
  }