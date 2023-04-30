import { ObjectId, Types } from "mongoose";
import validationPointModel from "../model/ValidationPoint";



export async function listValidationPoints(listingOptions: any) {

    const { validationTag } = listingOptions

    if (!validationTag && !validationTag.id) {
        throw new Error('Must include validation tag id!')
    }

    const validationPoint = await validationPointModel.findOne({
        'parent.validationTag.id': validationTag.id
    })
    if(!validationPoint) {
        throw new Error(`Validation Tag doesn't include valdation points`)
    }

    const levels = (validationPoint.levelsOrder) as any

    const query = generateAggregationQuery(levels)
    console.dir(query, {depth: Infinity})
    const validationPoints = await validationPointModel.aggregate([
        {
            '$match': {
                'parent.validationTag.id': new Types.ObjectId(validationTag.id)
            }
        },
        ...query
    ])

    return { data: validationPoints }
}


function generateAggregationQuery(levelsOrder: any[]) {
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
            pipeline.push(groupStage('$levels', { 
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