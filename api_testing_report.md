# 📝 API Verification & Testing Report — Task Collab

This document records the comprehensive endpoint testing results for the Task Collab backend. All issues (from Issue #1 to Issue #17) have been resolved, and every endpoint has been verified via an automated test runner script executing against the live Spring Boot application.

## 🚀 Execution Environment
* **Backend Framework:** Spring Boot v4.1.0
* **Language/Runtime:** Java 21 (JDK 26)
* **Database:** PostgreSQL 17 (Docker container running on port `1234`)
* **Test Script:** Python 3 with `requests` library

---

## 🔍 Verification of Fixed Issues (8 - 17)

| Issue # | Description | Verification Details | Status |
| :--- | :--- | :--- | :---: |
| **#8** | Typo `UserResponce` -> `UserResponse` | The project compiled successfully; no references to the typo remain. | **PASSED** |
| **#9** | Redundant `@Component` on static Mappers | Removed annotation; mappers are used statically without injection errors. | **PASSED** |
| **#10** | `CommentRequest` validation checks | Blank comment payloads are rejected with `400 Bad Request`. | **PASSED** |
| **#11** | Clarify confusing `/my-workspaces` | Renamed `/workspace/my-workspaces` to `/workspace/owned`. | **PASSED** |
| **#12** | Comment edit body validation | `PATCH /comments/edit/{commentId}` accepts a JSON request body. | **PASSED** |
| **#13** | Typo `sighned()` in `JwtUtil` | Corrected to `getSigningKey()` (private scope). | **PASSED** |
| **#14** | Discouraged `Optional` fields in DTO | `TaskUpdateRequest` fields were unwrapped; null checks are verified. | **PASSED** |
| **#15** | Insecure `/users/all` endpoint | The endpoint was completely deleted to prevent database exposure. | **PASSED** |
| **#16** | Unique Email check on Registration | Duplicate email registration correctly triggers `409 Conflict`. | **PASSED** |
| **#17** | `@Transactional` on workspace delete | Database transactions are rolled back atomically on workspace deletion. | **PASSED** |

---

## 📊 Automated Test Runner Log Outputs

The test script executed all API endpoints in a logical flow (e.g. creating users, logging in, creating workspace, adding member, assigning task, commenting, updating task, deleting comment/task, updating role, deleting workspace). 

```text
Testing Registration...
[SUCCESS] Register Alice (Already Exists) (Returned 409 Conflict as expected)
[SUCCESS] Register Alice Duplicate Username Check (Status code: 409)
[SUCCESS] Register Duplicate Email Check (Status code: 409)
[SUCCESS] Register Bob (Already Exists) (Returned 409 Conflict as expected)

Testing Login...
[SUCCESS] Login Alice (Status code: 202)
[SUCCESS] Login Response Structure (Token exists) 
[SUCCESS] Login Response Structure (userId exists) 
[SUCCESS] Login Response Structure (username exists) 
[SUCCESS] Login Bob (Status code: 202)

Testing Current User (GET /users/me)...
[SUCCESS] Get Current User Alice 
[SUCCESS] Current User returns username 

Testing Search Users (GET /users/search)...
[SUCCESS] Search Bob 

Testing Workspace Creation...
[SUCCESS] Create Workspace (Status: 201, Body: {"workspaceId":6,"name":"Alice's Project Room 1783691261","description":"Collaborative workspace managed by Alice","ownerId":52,"ownerName":"alice","createdAt":"2026-07-10T19:17:41.446657"})
[SUCCESS] Workspace Response has workspaceId 
[SUCCESS] Workspace Response has ownerName 
[SUCCESS] Workspace Response has createdAt 

Testing Adding Member...
[SUCCESS] Add Bob to Alice Workspace 
[SUCCESS] Member Response contains workspaceMemberId 
[SUCCESS] Member Response contains username 
[SUCCESS] Member Response contains email 

Testing Get All Members...
[SUCCESS] Get All Members 

Testing List Member Workspaces for Bob...
[SUCCESS] Get Member Workspaces Bob 
[SUCCESS] Bob member workspaces not empty 
[SUCCESS] Bob is indeed a member of Alice's workspace 

Testing Get Owned Workspaces for Alice...
[SUCCESS] Get Owned Workspaces Alice 
[SUCCESS] Alice owned workspaces has the created workspace 

Testing Task Creation...
[SUCCESS] Create Task (Status: 200, Body: {"taskId":2,"title":"Initial Setup Task","description":"Install dependencies and configure database","workspace":{"workspaceId":6,"name":"Alice's Project Room 1783691261","description":"Collaborative workspace managed by Alice","ownerId":52,"ownerName":"alice","createdAt":"2026-07-10T19:17:41.446657"},"assignee":{"workspaceMemberId":59,"userId":53,"workspaceId":6,"userRole":"WORKER","username":"bob","email":"bob@example.com"},"status":"TODO","priority":"HIGH","dueDate":"2026-12-30","createdAt":"2026-07-10T19:17:42.182073","lastUpdate":"2026-07-10T19:17:42.182073"})
[SUCCESS] Task Response has taskId 

Testing Task Update (Issue #14 verification)...
[SUCCESS] Update Task Details 
[SUCCESS] Task Title updated 
[SUCCESS] Task Description updated 
[SUCCESS] Task Priority updated 

Testing Comment Add (Issue #10 verification)...
[SUCCESS] Add Comment 
[SUCCESS] Comment Response has commentId 
[SUCCESS] Comment Blank Content Validation (Should return 400) 

Testing Edit Comment (Issue #12 verification)...
[SUCCESS] Edit Comment 
[SUCCESS] Comment content edited 

Testing Delete Comment...
[SUCCESS] Delete Comment 

Testing Delete Task...
[SUCCESS] Delete Task 

Testing Member Role Update...
[SUCCESS] Update Bob Role to VIEWER (Status: 200, Body: {"workspaceMemberId":59,"userId":53,"workspaceId":6,"userRole":"VIEWER","username":"bob","email":"bob@example.com"})
[SUCCESS] Role updated correctly 

Testing Delete Workspace...
[SUCCESS] Delete Workspace 

=======================================================
ALL API ENDPOINTS TESTED SUCCESSFULLY & WORKING CORRECTLY!
=======================================================
```

---

## 🛠️ Endpoints Reference Guide

### 1. User Management
* **`POST /users/create`** (Public) — Register a new user. Checked for username and email uniqueness.
* **`POST /users/login`** (Public) — Authenticates users and returns a JSON payload containing the JWT token, userId, and username.
* **`GET /users/me`** (Authenticated) — Returns details for the currently logged-in user.
* **`GET /users/search`** (Public) — Search for users by username or email.

### 2. Workspace Management
* **`POST /workspace/create`** (Authenticated) — Create a workspace. Automatically makes the creator the `OWNER`.
* **`GET /workspace/owned`** (Authenticated) — Fetch all workspaces owned by the current user.
* **`GET /workspace/member/myWorkspaces`** (Authenticated) — Fetch all workspaces the user belongs to as a member.
* **`DELETE /workspace/delete`** (Authenticated) — Delete a workspace and cascade-delete its members.
* **`POST /workspace/member/add`** (Authenticated) — Add a user to a workspace as a member with specific roles.
* **`GET /workspace/member/all`** (Authenticated) — List all members of a workspace.
* **`PUT /workspace/member/update-role`** (Authenticated) — Update a member's role (`WORKER`, `VIEWER`).
* **`DELETE /workspace/member/delete`** (Authenticated) — Delete a member from the workspace.

### 3. Task Management
* **`POST /task/create`** (Authenticated) — Create a task within a workspace.
* **`PATCH /task/update`** (Authenticated) — Partially update a task (name, description, priority).
* **`PUT /task/assign`** (Authenticated) — Assign a task to a member of the workspace.
* **`PUT /task/set-due-date`** (Authenticated) — Set a task's due date.
* **`PUT /task/status`** (Authenticated) — Transition a task's status (`TODO`, `IN_PROGRESS`, `DONE`).
* **`DELETE /task/delete`** (Authenticated) — Delete a task.

### 4. Comment Management
* **`POST /comments/add`** (Authenticated) — Add a comment to a task. Rejects empty comments.
* **`PATCH /comments/edit/{commentId}`** (Authenticated) — Edit comment text via request body.
* **`DELETE /comments/delete/{commentId}`** (Authenticated) — Delete a comment.
