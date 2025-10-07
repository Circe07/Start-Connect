# StartAndConnect - API de Gestión de Grupos (Node.js / Express / Firebase) 🚀

---

## 🌎 English

### Project Overview

This project delivers a **robust RESTful API** for managing user groups and memberships, built on **Node.js**, **Express**, and **Cloud Firestore**. It provides all the necessary core functionalities for creating, managing, and interacting with user communities within an application context.

### Key Features and Endpoints ✨

The API uses **Firebase Authentication Middleware** for most endpoints and supports the following functionalities:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/createGroup` | Creates a new group. Creator is set as `ownerId` and first member. | Yes |
| `POST` | `/joinGroup` | Adds the authenticated user to a group. Atomically increments `memberCount`. | Yes |
| `POST` | `/leaveGroup` | Removes the user from the group. Includes **owner logic** (delete if last member, otherwise requires `newOwnerId`). | Yes |
| `POST` | `/groups/:groupId/removeMember` | **Owner only:** Removes a specified member from the group. | Yes (Owner) |
| `POST` | `/groups/:groupId/transferOwnership`| **Owner only:** Transfers group ownership to another existing member. | Yes (Owner) |
| `PATCH` | `/groups/:groupId` | **Owner only:** Updates group details (name, description, city, `isPublic`). | Yes (Owner) |
| `GET` | `/groups/:groupId` | Retrieves full group details, including the complete member list. | Yes (Member) |
| `GET` | `/myGroups` | Retrieves a list of all groups the authenticated user is a member of. | Yes |
| `GET` | `/publicGroups?limit=X&startAfterId=Y` | Retrieves a **paginated list** of all publicly visible groups. | No |

---

### Prerequisites 🛠️

Before deploying or running this project, ensure you have the following:

* **Node.js (LTS recommended)** and `npm` or `yarn` installed.
* A **Firebase Project** set up in the [Firebase Console](https://console.firebase.google.com/).
* **Cloud Firestore** and **Firebase Authentication** enabled.
* **Firebase Admin SDK Service Account Key**:
    * Download the JSON key from **Project settings > Service accounts**.
    * **Rename this file to `serviceAccountKey.json`** (or adjust the path in `firebase.js`) and place it in the **root** of your project.
    * 🚨 **SECURITY WARNING**: Ensure this file is included in your `.gitignore` and **NEVER** committed to version control.

#### ⚙️ Critical: Firestore Indexing

For efficient querying, especially for the paginated public groups (`/publicGroups`), you **MUST** create the following **composite index** in your Firestore console:

* `Collection`: `groups`
* `Fields`:
    1.  `isPublic` (ascending)
    2.  `createdAt` (descending)
    3.  `__name__` (ascending) *(Used for cursor-based pagination.)*

---

### Installation & Local Setup 💻

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:Circe07/Start-Connect.git 
    cd Start-Connect
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Place your `serviceAccountKey.json`** in the project root.
4.  **Run the server locally:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The API will run on `http://localhost:3000` (as configured in `index.js`).

---

### Deployment to Firebase Cloud Functions ☁️ (Recommended)

This API is designed to be easily deployed to Firebase Cloud Functions, exposing the entire Express application via a single function endpoint.

1.  **Initialize Firebase:**
    ```bash
    firebase init functions
    ```
2.  **Edit the Function Entry Point (`functions/index.js`):**
    Modify the functions entry point to import your Express app (`../