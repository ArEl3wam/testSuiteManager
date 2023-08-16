import express from 'express'
import { Types } from "mongoose";
import { ValidationPointBase, getValidationPointModel } from "../model/ValidationPoint";
import {ValidationPointUpdate } from '../interfaces/ValidationPointResultInterface';
import { LinkingResourcesError, NotFoundError } from "../shared/errors";
import {getValidationTagModel} from "../model/ValidationTag";
import { getTestSuiteModel } from "../model/TestSuite";
import {getTestCaseModel} from "../model/TestCase";
import APIFeatures from "./../shared/apiFeatures";



export async function listValidationPoints(listingOptions: any) {

    const { validationTag } = listingOptions

    if (!validationTag && !validationTag.id) {
        throw new Error('Must include validation tag id!')
    }

    const validationPoint = await getValidationPointModel().findOne({
        'parent.validationTag.id': validationTag.id
    })
    if(!validationPoint) {
        throw new Error(`Validation Tag doesn't include valdation points`)
    }

    const levels = (validationPoint.levelsOrder) as any
    const [{ deepestLevels }] = await getValidationPointModel().aggregate([
        {
            '$match': {
                'parent.validationTag.id': new Types.ObjectId(validationTag.id)
            }
        },
        {
            '$group': {
                '_id': null,
                'deepestLevels': {
                    '$max': '$levelsOrder'
                }
            }
        }
    ])

    const query = generateAggregationQuery(deepestLevels.length)
    console.dir(query, {depth: Infinity})
    const validationPoints = await getValidationPointModel().aggregate([
        {
            '$match': {
                'parent.validationTag.id': new Types.ObjectId(validationTag.id)
            }
        },
        ...query
    ])

    return { data: fixOut(validationPoints) }
}


function generateAggregationQuery(levelsLength: number) {
    const levelsOrder: number[] = [];
    for(let i = 0; i < levelsLength; ++i) {
        levelsOrder.push(i)
    }
    const levels: any = levelsOrder.reduce((acc, cur) => {
        Object.assign(acc, {
            [cur]: `$_id.${cur}`
        })
        return acc
    }, {})
    
    levelsOrder.reverse()
    const pipeline: any[] = []
    for(let i = 0; i < levelsOrder.length; ++i) {
        if (i == 0) {
            pipeline.push(groupStage('$modifiedLevels', { 
                metaData: '$metaData',
                results: '$results'
                })
            )
            continue
        }
        pipeline.push(groupStage(
            levelsOrder.slice(i).reduce((acc, cur) => {
            return { ...acc, [cur]: levels[cur] }
            }, {}),
            {
                children: '$children',
                [levelsOrder[i - 1]]: levels[levelsOrder[i - 1]]
            })
        )

        pipeline.push({
            '$addFields': {
                [levelsOrder[i]]: levels[levelsOrder[i]]
            }
        })
        
    }
    if(levelsOrder.length == 1) {
        pipeline.push({
            '$addFields': {
                [levelsOrder[0]]: levels[levelsOrder[0]]
            }
        })
    }
    pipeline.push({
        "$project": {
            "_id": 0
        }
    })
    return pipeline
}


const groupStage = (groupBy: object | string, pushKeys: object) => {
    return {
            "$group": {
                "_id": groupBy,
                "children": {
                    "$push": pushKeys
                }
            }
        }
}

const fixOut = (nestedLevels: any[]) => {

    return nestedLevels.flatMap((level) =>  {
        const newLevel = {}
        const keys = Object.keys(level)
        if (keys.length == 2 && keys.includes('children')) {
            const levelname: string = level[keys[0] != 'children' ? keys[0] : keys[1]]
            const [newKey, newValue] = levelname.split(':')
            Object.assign(newLevel, {
                children: fixOut(level.children),
                [newKey]: newValue
            })
        } else if (keys.includes('children')) {
            return level.children
        } else {
            return level
        }

        return newLevel
    })
}

export function parseValidationPointResults(requestBody: Record<string, any>): any{
        const validationPointResults: any = [];
    
        for (let key in requestBody) {
            if (requestBody.hasOwnProperty(key)) {
                const vp: any = {
                    name: key,
                    ...requestBody[key]
                };
                validationPointResults.push(vp);
            }
        }
        return validationPointResults.length > 0 ? validationPointResults : null;
}

export async function addValidationPointToValidationTag(validationTagId: string, validationPoint: { id?: Types.ObjectId, _id?: Types.ObjectId } ) {
    try {
        await getValidationTagModel().findByIdAndUpdate(validationTagId, {
            $push: {
                validationPointRefs: (validationPoint.id) ? validationPoint.id : validationPoint._id
            }
        }).orFail()
        
    } catch (err: unknown) {
        console.log(err)
        throw new LinkingResourcesError(`Couldn't link validation point to validation tag with id '${validationTagId}'`)
    }
}


export async function updateValdationPoint(validationPointId: string, updateInfo: ValidationPointUpdate | undefined) {

    try {
        if(!updateInfo) return
        let validationPoint
        
        validationPoint = await getValidationPointModel().findByIdAndUpdate(validationPointId, updateInfo, {
            new: true
        })
        
        if(!validationPoint) throw new NotFoundError('ValidationPoint Not found')
            return validationPoint
        
        
    } catch (err: unknown) {
        throw err
    }
}

export async function  updateParentsEndDate(validationPoint: ValidationPointBase) {
    const { testCase, testSuite, validationTag } = validationPoint.parent

    return Promise.allSettled([
        getTestSuiteModel().findByIdAndUpdate(testSuite.id, {
            '$max': {
                'end_date': validationPoint.creation_date
            }
        }),
        getTestCaseModel().findByIdAndUpdate(testCase.id, {
            '$max': {
                'end_date': validationPoint.creation_date
            }
        }),
        getValidationTagModel().findByIdAndUpdate(validationTag.id, {
            '$max': {
                'end_date': validationPoint.creation_date
            }
        })
    ])
}

export async function getAllValidationPointsOfvalidationTagService(testCaseId: string, req: express.Request) {
    try {
        const validationTagData = await getValidationTagModel().findById(testCaseId, { '_v': 0 }).exec()
        if (!validationTagData) { 
            throw new Error(`ValidationTag with id '${testCaseId}' not found`)
        }
        let query = getValidationPointModel().find({ '_id': { $in: validationTagData.validationPointRefs } })
        let api = APIFeatures.getInstance(query, req.query).filter().sort().limitFields().paginate()
        return api.getQuery().exec()
    }
    catch (err: any) {
        throw new Error(`ValidationTag with id '${testCaseId}' not found`)
    }
    
}
    