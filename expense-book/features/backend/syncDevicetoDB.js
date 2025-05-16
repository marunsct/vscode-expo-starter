import { fetchWithAuth } from '../../app/authContext';
import { db } from '../../database/db';

//const db = SQLite.openDatabaseSync('expenseBook.db');

// Export a constant function called syncPendingActions
/**
 * Synchronizes pending actions stored in the database.
 * This function retrieves all actions from the `sync_queue` table, processes each action by making a fetch request,
 * and deletes the action from the table if the request is successful. The process stops if any error occurs or if
 * the backend returns an error response to avoid repeated failures.
 */
export const syncPendingActions = async () => {
  // Get all actions from the sync_queue table in the database, ordered by created_at in ascending order
  const actions = await db.getAllAsync(`SELECT * FROM sync_queue ORDER BY created_at ASC;`);
  
  // Loop through each action
  for (const action of actions) {
    try {
      // Parse the options from the action
      const options = JSON.parse(action.options);
      
      // Make a fetch request with the action's url and options
      const response = await fetchWithAuth(action.url, options);
      
      // If the response is ok, delete the action from the sync_queue table
      if (response.ok) {
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?;`, [action.id]);
      } else {
        // Stop if backend returns error (to avoid repeated failures)
        break;
      }
    } catch (e) {
      // Stop on error (e.g., still offline)
      console.error(e);
      break;
    }
  }
};
