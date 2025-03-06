# apriori

apriori is a single‑page productivity application built with HTML, CSS, and JavaScript. It helps users manage their daily tasks, track habits, and plan events—all while storing data locally in the browser's Local Storage.

## Features

- **User Authentication**
  - Register and log in.
  - On login, a transition screen displays a random quote.
  - The power‑off icon in the header logs the user out.

- **Dashboard (Home)**
  - Displays an overview of the most recent incomplete tasks, top habits (by repetitions), and upcoming events—all rendered as clickable cards.
  - Each section includes a link to navigate to the full module with bottom‑navigation highlighting.

- **To‑Do Module**
  - Create, edit, and delete tasks.
  - Tasks include a title, estimated time, category, deadline, description, and a completion status.
  - Tasks are rendered as clickable cards displaying key details.
  - Custom‑styled checkboxes (an outlined circle that fills with a green check when completed) and icon buttons for editing and deletion are provided.
  - Sorting and filtering controls allow you to view tasks by status, category, deadline, and time estimate.

- **Habit Tracker**
  - Add, edit, and delete habits.
  - Track habit repetitions and set a priority.
  - Habits are displayed as cards showing title, priority, and repetition count.
  - Supports filtering and sorting by priority or number of repetitions.

- **Event Planner**
  - Create, edit, and delete events.
  - Events include a name, start date/time, and an optional end date/time.
  - Events are rendered as cards displaying event details.
  - Filtering options let you view upcoming or past events.

## Project Structure

- **index.html**  
  Contains the layout and structure of the application, including modals, page sections, and the bottom navigation.

- **styles.css**  
  Provides the styling for a modern, card‑based UI. It includes custom styles for modals, cards, navigation, and controls.

- **script.js**  
  Implements the application logic:
  - User registration and login (with a transition screen displaying a random quote).
  - CRUD operations for tasks, habits, and events.
  - Rendering of items as clickable cards.
  - Filtering, sorting, and page navigation.

## Getting Started

### Prerequisites

A modern web browser (Chrome, Firefox, Edge, etc.) is required. All data is stored locally, so no backend setup is needed.

### Running the Application

1. **Clone the Repository:**

   ```bash
   git clone <repository_url>
   cd <repository_folder>