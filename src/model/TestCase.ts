import mongoose, { Types } from 'mongoose';
import { DbConnectionHandler } from './../shared/DbConnectionsHandler'

const Schema = mongoose.Schema;

let testCaseSchema = new Schema<TestCaseBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: Schema.Types.Boolean,
        default: true
    },
    parent: {
        testSuite: {
            id: {
                type:mongoose.Schema.Types.ObjectId,
                ref:'testSuite'
            }
        }
    },
    validationTagRefs: {
        type:[mongoose.Schema.Types.ObjectId],
        ref:'validationTag'
    },
    end_date: {
        type: Schema.Types.Date
    },
    creation_date: {
        type: Schema.Types.Date
    },
    incrementalId: {
        type: Schema.Types.Number
    },
    
}, { toJSON: { virtuals: true }});

testCaseSchema.virtual('validationTags_count').get(function () {
    return this.validationTagRefs?.length
})


testCaseSchema.index({ "parent.testSuite.id": 1 })
testCaseSchema.index({ "status": 1 })
testCaseSchema.index({ "incrementalId": 1 })

export function getTestCaseModel(databaseName: any) {
    const connection: mongoose.Connection = DbConnectionHandler.getInstance().getLogsDbConnection(databaseName);

    return connection.model<TestCaseBase>('testCase',testCaseSchema);;
}
interface TestCaseBase {
    metaData: object,
    status: boolean,
    validationTagRefs?: Types.ObjectId[],
    parent: {
        testSuite: {
            id: Types.ObjectId
        }
    }
    validationTags_count?: number,
    end_date: Date,
    creation_date: Date
    incrementalId: number
}