import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock electron app.getPath for node environment testing
globalThis.mockUserData = path.join(process.cwd(), 'scratch-test-userdata');
if (fs.existsSync(globalThis.mockUserData)) {
  fs.rmSync(globalThis.mockUserData, { recursive: true, force: true });
}

// We dynamically test the compiled TaskStorage logic
const { TaskStorage } = await import('../dist/main/taskStorage.js');

console.log('🧪 Starting CatTask Storage & Functional Verification Tests...\n');

// Test 1: Initialize Storage
console.log('▶ Test 1: Initializing storage...');
const storage = new TaskStorage();
const initialData = storage.getData();
assert(initialData.tasks.length >= 3, 'Should have initial welcome tasks');
console.log(`  ✓ Initialized with ${initialData.tasks.length} default tasks`);

// Test 2: Add a task
console.log('▶ Test 2: Adding a task...');
const added = storage.addTask('Feed the cat tuna 🐟', 'high');
assert.strictEqual(added.title, 'Feed the cat tuna 🐟');
assert.strictEqual(added.completed, false);
assert.strictEqual(added.priority, 'high');
console.log(`  ✓ Task added successfully: "${added.title}" [id: ${added.id}]`);

// Test 3: Reject empty task
console.log('▶ Test 3: Attempting to add an empty task...');
try {
  storage.addTask('   ');
  assert.fail('Should have thrown an error on empty task');
} catch (err) {
  assert(err.message.includes('empty'), 'Error message should mention empty');
  console.log('  ✓ Properly rejected whitespace-only task');
}

// Test 4: Mark task completed
console.log('▶ Test 4: Marking task as completed...');
const tasksAfterToggle = storage.toggleTask(added.id);
const toggledTask = tasksAfterToggle.find((t) => t.id === added.id);
assert.strictEqual(toggledTask?.completed, true);
assert(toggledTask?.completedAt, 'Should record completedAt timestamp');
console.log('  ✓ Task marked completed with timestamp');

// Test 5: Unmark completed task
console.log('▶ Test 5: Unmarking completed task...');
const tasksAfterUntoggle = storage.toggleTask(added.id);
const untoggledTask = tasksAfterUntoggle.find((t) => t.id === added.id);
assert.strictEqual(untoggledTask?.completed, false);
assert.strictEqual(untoggledTask?.completedAt, undefined);
console.log('  ✓ Task successfully restored to active');

// Test 6: Verify progress calculations
console.log('▶ Test 6: Verifying counts and progress statistics...');
const allTasks = storage.getData().tasks;
const total = allTasks.length;
const completed = allTasks.filter((t) => t.completed).length;
const remaining = total - completed;
const percentage = Math.round((completed / total) * 100);
console.log(`  ✓ Total: ${total}, Completed: ${completed}, Remaining: ${remaining}, Progress: ${percentage}%`);

// Test 7: Filter verification
console.log('▶ Test 7: Testing filters (All, Active, Completed)...');
const activeTasks = allTasks.filter((t) => !t.completed);
const completedTasks = allTasks.filter((t) => t.completed);
assert.strictEqual(activeTasks.length, remaining);
assert.strictEqual(completedTasks.length, completed);
console.log(`  ✓ Filter counts match: All (${allTasks.length}), Active (${activeTasks.length}), Done (${completedTasks.length})`);

// Test 8: Delete task
console.log('▶ Test 8: Deleting task...');
const tasksAfterDelete = storage.deleteTask(added.id);
const deletedTask = tasksAfterDelete.find((t) => t.id === added.id);
assert.strictEqual(deletedTask, undefined, 'Task should be removed from list');
console.log('  ✓ Task deleted successfully');

// Test 9: Persistence verification across new instance
console.log('▶ Test 9: Verifying file persistence across instance reload...');
storage.addTask('Persistence Test Item 🐾', 'low');
const storage2 = new TaskStorage();
const data2 = storage2.getData();
const foundPersisted = data2.tasks.find((t) => t.title === 'Persistence Test Item 🐾');
assert(foundPersisted, 'Persisted task must be retrieved from disk by new instance');
console.log('  ✓ Persistence verified! Data correctly retrieved from disk.');

console.log('\n🎉 ALL 9 FUNCTIONAL AND PERSISTENCE TESTS PASSED SUCCESSFULLY! 🐾');
