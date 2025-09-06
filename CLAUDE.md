# Claude Instructions

## Task Planning and Execution

### Always Create Todo Lists
- Before starting any multi-step task, ALWAYS use the TodoWrite tool to create a detailed plan
- Break down complex tasks into specific, actionable steps
- Show the todo list to the user for review before proceeding
- Execute tasks step by step, updating the todo list status as you progress

### Todo List Requirements
- Use clear, descriptive task names in imperative form (e.g., "Fix authentication bug")
- Include activeForm for in-progress display (e.g., "Fixing authentication bug")
- Mark exactly ONE task as in_progress at any time
- Mark tasks as completed IMMEDIATELY after finishing each step
- Never batch multiple completions - update status in real-time

### Task Management Flow
1. Analyze the user's request
2. Create comprehensive todo list using TodoWrite
3. Show plan to user
4. Mark first task as in_progress
5. Execute the task
6. Mark task as completed when finished
7. Move to next task and repeat

### When to Use Todo Lists
- Multi-step tasks (3+ actions required)
- Complex implementations or refactoring
- User provides multiple tasks or requirements
- Any non-trivial development work

### Task Completion Standards
- Only mark tasks completed when fully accomplished
- If errors or blockers occur, keep task in_progress and create new tasks for resolution
- Never mark incomplete work as completed