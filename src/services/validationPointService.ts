import { ObjectId, Types } from "mongoose";
import { validationPointModel } from "../model/ValidationPoint";
import {ValidationPointResultInterface } from '../interfaces/ValidationPointResultInterface';



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
    const [{ deepestLevels }] = await validationPointModel.aggregate([
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

    console.log(deepestLevels, levels)
    const query = generateAggregationQuery(deepestLevels.length)
    console.dir(query, {depth: Infinity})
    const validationPoints = await validationPointModel.aggregate([
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

export async function parseValidationPointResults(requestBody: object): Promise<ValidationPointResultInterface[] | null> {
    const validationPointResults: ValidationPointResultInterface[] = [];
  
    for (let key in requestBody) {
      if (requestBody.hasOwnProperty(key)) {
        const vp: ValidationPointResultInterface = {
          name: key,
          status: (requestBody as { [key: string]: any })[key].status,
          expected: (requestBody as { [key: string]: any })[key].expected,
          actual: (requestBody as { [key: string]: any })[key].actual,
          tolerance: (requestBody as { [key: string]: any })[key].tolerance,
        };
        validationPointResults.push(vp);
      }
    }
  
    return validationPointResults.length > 0 ? validationPointResults : null;
  }