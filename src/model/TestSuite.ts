import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;

let testSuiteSchema = new Schema({
    metaData: Schema.Types.Mixed,
    status: Boolean,
    testCaseRef: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'testCase'
    },

    validationTagRefs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'validationTag',
        default: []
    },

    end_date: {
        type: Schema.Types.Date
    },
    creation_date: {
        type: Schema.Types.Date
    }
    
}, { toJSON: { virtuals: true }});

testSuiteSchema.virtual('testCases_count').get(function () {

    return this.testCaseRef?.length
})
testSuiteSchema.index({ "metaData.owner": 1 })
testSuiteSchema.index({ "metaData.version": 1 })
testSuiteSchema.index({ "metaData.machine": 1 })
testSuiteSchema.index({ "metaData.compilation_mode": 1 })
testSuiteSchema.index({ "metaData.platform": 1 })
testSuiteSchema.index({ "metaData.solution": 1 })
testSuiteSchema.index({ "metaData.tool_name": 1 })
testSuiteSchema.index({ "status": 1 })


export const testSuiteModel = model('testSuite', testSuiteSchema);
// export default testSuiteModel;
module.exports = { testSuiteModel };
