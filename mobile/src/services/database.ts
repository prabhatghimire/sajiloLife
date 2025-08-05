// import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
    this.databaseName = 'SajiloLife.db';
    this.databaseVersion = '1.0';
    this.databaseDisplayname = 'Sajilo Life Database';
    this.databaseSize = 200000;
  }

  async init() {
    try {
      this.database = await SQLite.openDatabase({
        name: this.databaseName,
        version: this.databaseVersion,
        displayName: this.databaseDisplayname,
        size: this.databaseSize,
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async createTables() {
    const createDeliveryRequestsTable = `
      CREATE TABLE IF NOT EXISTS delivery_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id TEXT UNIQUE,
        server_id INTEGER,
        customer_id INTEGER,
        partner_id INTEGER,
        pickup_address TEXT NOT NULL,
        dropoff_address TEXT NOT NULL,
        pickup_lat REAL,
        pickup_lng REAL,
        dropoff_lat REAL,
        dropoff_lng REAL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_notes TEXT,
        status TEXT DEFAULT 'pending',
        estimated_distance REAL,
        estimated_duration INTEGER,
        actual_distance REAL,
        actual_duration INTEGER,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );
    `;

    const createSyncLogsTable = `
      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        sync_status TEXT NOT NULL,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        synced_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES delivery_requests (id)
      );
    `;

    const createUpdatesTable = `
      CREATE TABLE IF NOT EXISTS pending_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        server_id INTEGER,
        update_data TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES delivery_requests (id)
      );
    `;

    try {
      await this.database.executeSql(createDeliveryRequestsTable);
      await this.database.executeSql(createSyncLogsTable);
      await this.database.executeSql(createUpdatesTable);
      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Delivery Requests Methods
  async saveDeliveryRequest(request) {
    try {
      const {
        local_id,
        server_id,
        customer_id,
        partner_id,
        pickup_address,
        dropoff_address,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        customer_name,
        customer_phone,
        delivery_notes,
        status,
        estimated_distance,
        estimated_duration,
        actual_distance,
        actual_duration,
        is_synced,
        created_at,
        updated_at,
      } = request;

      const query = `
        INSERT OR REPLACE INTO delivery_requests (
          local_id, server_id, customer_id, partner_id, pickup_address, dropoff_address,
          pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, customer_name, customer_phone,
          delivery_notes, status, estimated_distance, estimated_duration, actual_distance,
          actual_duration, is_synced, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        local_id,
        server_id,
        customer_id,
        partner_id,
        pickup_address,
        dropoff_address,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        customer_name,
        customer_phone,
        delivery_notes,
        status,
        estimated_distance,
        estimated_duration,
        actual_distance,
        actual_duration,
        is_synced ? 1 : 0,
        created_at,
        updated_at,
      ];

      const [result] = await this.database.executeSql(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error saving delivery request:', error);
      throw error;
    }
  }

  async getDeliveryRequest(id) {
    try {
      const query =
        'SELECT * FROM delivery_requests WHERE id = ? OR local_id = ?';
      const [results] = await this.database.executeSql(query, [id, id]);

      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('Error getting delivery request:', error);
      throw error;
    }
  }

  async getAllDeliveryRequests() {
    try {
      const query = 'SELECT * FROM delivery_requests ORDER BY created_at DESC';
      const [results] = await this.database.executeSql(query);

      const requests = [];
      for (let i = 0; i < results.rows.length; i++) {
        requests.push(results.rows.item(i));
      }
      return requests;
    } catch (error) {
      console.error('Error getting all delivery requests:', error);
      throw error;
    }
  }

  async getUnsyncedRequests() {
    try {
      const query = 'SELECT * FROM delivery_requests WHERE is_synced = 0';
      const [results] = await this.database.executeSql(query);

      const requests = [];
      for (let i = 0; i < results.rows.length; i++) {
        requests.push(results.rows.item(i));
      }
      return requests;
    } catch (error) {
      console.error('Error getting unsynced requests:', error);
      throw error;
    }
  }

  async updateDeliveryRequest(id, updates) {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');

      const query = `UPDATE delivery_requests SET ${setClause} WHERE id = ? OR local_id = ?`;
      const params = [...Object.values(updates), id, id];

      await this.database.executeSql(query, params);
      return true;
    } catch (error) {
      console.error('Error updating delivery request:', error);
      throw error;
    }
  }

  async deleteDeliveryRequest(id) {
    try {
      const query =
        'DELETE FROM delivery_requests WHERE id = ? OR local_id = ?';
      await this.database.executeSql(query, [id, id]);
      return true;
    } catch (error) {
      console.error('Error deleting delivery request:', error);
      throw error;
    }
  }

  // Sync Logs Methods
  async saveSyncLog(log) {
    try {
      const { request_id, sync_status, error_message, retry_count, synced_at } =
        log;

      const query = `
        INSERT INTO sync_logs (request_id, sync_status, error_message, retry_count, synced_at)
        VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        request_id,
        sync_status,
        error_message,
        retry_count,
        synced_at,
      ];
      const [result] = await this.database.executeSql(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error saving sync log:', error);
      throw error;
    }
  }

  async getSyncLogs(requestId) {
    try {
      const query =
        'SELECT * FROM sync_logs WHERE request_id = ? ORDER BY created_at DESC';
      const [results] = await this.database.executeSql(query, [requestId]);

      const logs = [];
      for (let i = 0; i < results.rows.length; i++) {
        logs.push(results.rows.item(i));
      }
      return logs;
    } catch (error) {
      console.error('Error getting sync logs:', error);
      throw error;
    }
  }

  // Pending Updates Methods
  async savePendingUpdate(update) {
    try {
      const { request_id, server_id, update_data } = update;

      const query = `
        INSERT INTO pending_updates (request_id, server_id, update_data)
        VALUES (?, ?, ?)
      `;

      const params = [request_id, server_id, JSON.stringify(update_data)];
      const [result] = await this.database.executeSql(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error saving pending update:', error);
      throw error;
    }
  }

  async getUnsyncedUpdates() {
    try {
      const query = 'SELECT * FROM pending_updates WHERE is_synced = 0';
      const [results] = await this.database.executeSql(query);

      const updates = [];
      for (let i = 0; i < results.rows.length; i++) {
        const update = results.rows.item(i);
        update.update_data = JSON.parse(update.update_data);
        updates.push(update);
      }
      return updates;
    } catch (error) {
      console.error('Error getting unsynced updates:', error);
      throw error;
    }
  }

  async markUpdateSynced(updateId) {
    try {
      const query = 'UPDATE pending_updates SET is_synced = 1 WHERE id = ?';
      await this.database.executeSql(query, [updateId]);
      return true;
    } catch (error) {
      console.error('Error marking update synced:', error);
      throw error;
    }
  }

  // Utility Methods
  async clearSyncHistory() {
    try {
      await this.database.executeSql('DELETE FROM sync_logs');
      await this.database.executeSql('DELETE FROM pending_updates');
      return true;
    } catch (error) {
      console.error('Error clearing sync history:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.database) {
        await this.database.close();
        this.database = null;
      }
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
}

export const database = new DatabaseService();
