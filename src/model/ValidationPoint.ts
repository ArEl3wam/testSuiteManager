import mongoose, { Types } from 'mongoose';
import { ValidationPointResultInterface } from '../interfaces/ValidationPointResultInterface';
const Schema = mongoose.Schema;
const model = mongoose.model;

const validationPointSchema = new Schema<ValidationPointBase>({
    metaData: {
        type: Schema.Types.Mixed,
        default: {},
        required: true
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
    results: ValidationPointResultInterface[],
    status: boolean,
    creation_date: Date
}

export const validationPointModel = model<ValidationPointBase>('validationPoint', validationPointSchema);
export default validationPointModel;


const ValidationPoint = model('validationPoint', validationPointSchema);
module.exports = { ValidationPoint, validationPointModel };



