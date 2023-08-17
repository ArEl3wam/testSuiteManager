import mongoose, { Types } from 'mongoose';
import { DbConnectionHandler } from './../shared/DbConnectionsHandler'

const Schema = mongoose.Schema;


let validationPointSchema = new Schema<ValidationPointBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {},
        required: false
    },
    // type: {
    //     type: Schema.Types.String,
    //     default: "", //! Modify to the most frequent type
    //     required: false
    // },
    parent: {
        validationTag: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'validationTag'
            }
        },
        testCase: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'testCase'
            }
        },
        testSuite: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'testSuite'
            }
        },
        
    },
    levels: {
        type: Schema.Types.Mixed,
        default: {},
    },
    modifiedLevels: {
        type: Schema.Types.Mixed,
        default: {},
        select: false
    },
    levelsOrder: {
        type: [String],
        select: false
    },
    results:{
        type: [Object],
        // default: {},
        required: true 
    },
    status: {
        type: Schema.Types.Boolean,
        default: true
    },
    creation_date: {
        type: Schema.Types.Date
    }
});

export interface ValidationPointBase {
    metaData: object,
    // type: string,
    levels: object,
    levelsOrder: string[],
    modifiedLevels: object
    parent: {
        validationTag: {
            id: Types.ObjectId
        },
        testCase: {
            id: Types.ObjectId
        },
        testSuite: {
            id: Types.ObjectId
        }
    },
    results: [],
    status: boolean,
    creation_date: Date
}
validationPointSchema.index({ "parent.validationTag.id": 1 })
validationPointSchema.index({ "parent.testCase.id": 1 })
validationPointSchema.index({ "parent.testSuite.id": 1 })
validationPointSchema.index({ "status": 1 })


export function getValidationPointModel(databaseName: any): mongoose.Model<ValidationPointBase> {
    const connection: mongoose.Connection = DbConnectionHandler.getInstance().getLogsDbConnection(databaseName);
    return connection.model<ValidationPointBase>('validationPoint', validationPointSchema);
}
