import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;

const testSuiteSchema = new Schema({
    metaData: Schema.Types.Mixed,
    isSuccessful: Boolean,
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

export const testSuiteModel = model('testSuite', testSuiteSchema);
// export default testSuiteModel;
module.exports = { testSuiteModel };
