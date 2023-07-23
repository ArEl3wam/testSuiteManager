import mongoose, { Types } from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;

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
}, { toJSON: { virtuals: true }});

testCaseSchema.virtual('validationTags_count').get(function () {
    return this.validationTagRefs?.length
})


testCaseSchema.index({ "parent.testSuite.id": 1 })
testCaseSchema.index({ "status": 1 })


const testCaseModel = model<TestCaseBase>('testCase',testCaseSchema);
export default testCaseModel;



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
}