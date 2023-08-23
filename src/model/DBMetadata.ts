import mongoose from "mongoose";
import { DbConnectionHandler } from './../shared/DbConnectionsHandler'

let DBMetadataSchema = new mongoose.Schema({
    DatabaseName: {
        type: String,
        required: [true, 'Database Name is required'],
        unique: [true, 'Database Name must be unique']
    },
    SolutionName: {
        type: String,
        required: [true, 'Solution is required']
    }
}, { toJSON: { virtuals: true } });

DBMetadataSchema.index({ "DatabaseName": 1 })
DBMetadataSchema.index({ "SolutionName": 1 })

export function getDBMetadataModel() {
    const connection: mongoose.Connection = DbConnectionHandler.getInstance().getLogsDbConnection('DBMetadata');

    return connection.model('database', DBMetadataSchema);
}