import mongoose, { Types } from 'mongoose';
const Schema = mongoose.Schema;
const model = mongoose.model;

const validationPointSchema = new Schema<ValidationPointBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {},
        required: true
    },
    type: {
        type: Schema.Types.String,
        default: "", //! Modify to the most frequent type
        required: true
    },
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
        }
    },
    levels: {
        type: Schema.Types.Mixed,
        default: {}
    },
    levelsOrder: {
        type: [String],
    },
    body:{
        type: Schema.Types.Mixed,
        default: {},
        required: true 
    }
});

interface ValidationPointBase {
    metaData: object,
    type: string,
    levels: object,
    levelsOrder: string[],
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
    body: object
}

const validationPointModel = model<ValidationPointBase>('validationPoint', validationPointSchema);
export default validationPointModel;