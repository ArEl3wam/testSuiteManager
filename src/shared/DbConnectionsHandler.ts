import mongoose from "mongoose";

require("dotenv").config({
  path: `${__dirname}/../.env`,
});

export class DbConnectionHandler {
  private static instance: DbConnectionHandler;
  private logsDbConnection: mongoose.Connection;
  private usersDbConnection: mongoose.Connection;

  private constructor() {
    const DB_URL: string = process.env["DB_URL"] || "mongodb://127.0.0.1:";
    const LOGS_DB_PORT: string = process.env["LOGS_DB_PORT"] || "27651";
    const USERS_DB_PORT: string = process.env["USERS_DB_PORT"] || "27650";
    this.logsDbConnection = mongoose.createConnection(
      `${DB_URL}${LOGS_DB_PORT}/`,
      {
        serverSelectionTimeoutMS: 3000,
      }
    );
    console.log(`connected to logs db on port ${LOGS_DB_PORT}`);
    // private usersDbConnection: mongoose.Connection;

    this.usersDbConnection = mongoose.createConnection(
      `${DB_URL}${USERS_DB_PORT}/`,
      {
        serverSelectionTimeoutMS: 3000,
      }
    );

    console.log(`connected to users db on port ${USERS_DB_PORT}`);
  }

  public static initialize() {
    DbConnectionHandler.getInstance();
  }

  public static getInstance(): DbConnectionHandler {
    if (!DbConnectionHandler.instance) {
      DbConnectionHandler.instance = new DbConnectionHandler();
    }

    return DbConnectionHandler.instance;
  }

  public getLogsDbConnection(databaseName?: string): mongoose.Connection {
    if (typeof databaseName !== "undefined") {
      this.logsDbConnection = this.logsDbConnection.useDb(
        databaseName.toString()
      );
    }
    return this.logsDbConnection;
  }

  public static updateLogsDbConnection(db_connection: mongoose.Connection) {
    DbConnectionHandler.instance.logsDbConnection = db_connection;
  }

  public getUsersDbConnection() {
    return this.usersDbConnection;
  }
}
