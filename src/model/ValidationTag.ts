import mongoose, { Types } from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;

const validationTagSchema = new Schema<ValidationTagBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {},
        required: true
    },
    isSuccessful: {
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
}, { toJSON: { virtuals: true }});


validationTagSchema.virtual('validationPoints_count').get(function () {
    return this.validationPointRefs?.length
})


interface ValidationTagBase {
    metaData: object,
    isSuccessful: boolean,
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
}

const validationTagModel = model<ValidationTagBase>('validationTag', validationTagSchema);
export default validationTagModel;