import mongoose, { Types } from 'mongoose';
import { DbConnectionHandler } from './../shared/DbConnectionsHandler'

const Schema = mongoose.Schema;



let validationTagSchema = new Schema<ValidationTagBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {},
        required: true
    },
    status: {
        type: Schema.Types.Boolean,
        default: true,
        required: true
    },
    parent: {
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
        }
    },
    validationPointRefs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'validationPoint',
        default: []
    },
    end_date: {
        type: Schema.Types.Date
    },
    creation_date: {
        type: Schema.Types.Date
    },

}, { toJSON: { virtuals: true }});


validationTagSchema.virtual('validationPoints_count').get(function () {
    return this.validationPointRefs?.length
})


interface ValidationTagBase {
    metaData: object,
    status: boolean,
    parent: {
        testCase: {
            id: Types.ObjectId
        },
        testSuite: {
            id: Types.ObjectId
        }
    }
    validationPointRefs: Types.ObjectId[],
    validationPoints_count?: number
    
    creation_date: Date,
    end_date: Date
}

validationTagSchema.index({ "parent.testCase.id": 1 })
validationTagSchema.index({ "parent.testSuite.id": 1 })
validationTagSchema.index({ "status": 1 })
validationTagSchema.index({ "validationPointRefs": 1 })
validationTagSchema.index({ "creation_date": 1 })
validationTagSchema.index({ "end_date": 1 })

export function getValidationTagModel(databaseName: any): mongoose.Model<ValidationTagBase>{
    const connection: mongoose.Connection = DbConnectionHandler.getInstance().getLogsDbConnection(databaseName);
    return connection.model<ValidationTagBase>('validationTag', validationTagSchema);
}