import { PipelineStage } from "mongoose";
import { ResourceTypes, SearchOptions } from "../interfaces/SearchInterface";
import testCaseModel from "../model/TestCase";
import { validationPointModel } from "../model/ValidationPoint";
import validationTagModel from "../model/ValidationTag";
import { flattenObject } from "../shared/utils";
const testSuiteModel = require('../model/TestSuite').testSuiteModel;



enum ResourcesOrder {
    TS,
    TC,
    VT,
    VP
}
const resourceEnumLength = Object.keys(ResourcesOrder).length / 2

interface LookUpOption {
    from: string,
    as: string,
    foreignField: string,
    localField: string
    pipeline?: Exclude<PipelineStage, PipelineStage.Merge | PipelineStage.Out>[]
}
const lookupsOptions: Record<ResourceTypes, LookUpOption> = {
    TC: {
        from: 'testcases',
        as: 'children',
        foreignField: '_id',
        'localField': 'testCaseRef'
    },
    VT: {
        from: 'validationtags',
        as: 'children',
        'foreignField': '_id',
        'localField': 'validationTagRefs'
    },
    TS: {
        from: '',
        as: '',
        'foreignField': '',
        'localField': ''
    },
    VP: {
        from: 'validationpoints',
        as: 'children',
        'foreignField': '_id',
        'localField': 'validationPointRefs'
    },
}

const models = [testSuiteModel, testCaseModel, validationTagModel, validationPointModel]

export async function searchResources(searchOptions: SearchOptions) {
    const { select: rootResource, filteration } = searchOptions
    

    if(!filteration) return []
    console.dir(rootResource, { depth: Infinity })
    console.dir(filteration, { depth: Infinity })

    const pipeline: PipelineStage[] = []
    
    if (filteration[rootResource]) pipeline.push(matchUpStage(filteration[rootResource]))
    else pipeline.push(matchUpStage({}))

    for(let i = ResourcesOrder[rootResource] + 1; i < resourceEnumLength; ++i) {
        const lookupOption = Object.assign({}, lookupsOptions[<ResourceTypes>ResourcesOrder[i]])
        
        
        if(filteration[<ResourceTypes>ResourcesOrder[i]]) {
            lookupOption.pipeline = [matchUpStage(filteration[<ResourceTypes>ResourcesOrder[i]])]
        }

        const stage = lookupStage(
            fixDepth(i - ResourcesOrder[rootResource] - 1, lookupOption)
        )

        pipeline.push(stage)
        if(i != resourceEnumLength - 1) pipeline.push(unwindStage(i - ResourcesOrder[rootResource]))
    }

    for(let i = 1; i >= ResourcesOrder[rootResource]; --i) {
        
        let idGrouping: string | object = ''
        let pushObj: string | object = {
            '_id': '$_id.testCase.id',
            'children': '$children'
        }
        if(i  == 1) {
            idGrouping = '$' + 'children.'.repeat(i - ResourcesOrder[rootResource] + 1) + 'parent' 
                + ((ResourcesOrder[rootResource] == 1) ? '.testCase.id' : '')
            pushObj = '$' + 'children.'.repeat(i - ResourcesOrder[rootResource] + 1).slice(0, -1)

        } else if(i == 0){
            idGrouping = '$_id.testSuite.id'
        }
        
        pipeline.push(groupStage(idGrouping, pushObj))
    }
    console.dir(pipeline, { depth: Infinity })

    const results = await models[ResourcesOrder[rootResource]].aggregate(pipeline)

    return fixout(results)
}



function matchUpStage(options: any): PipelineStage.Match {
    return {
        '$match': flattenObject(options)
    }
}

function lookupStage(options: typeof lookupsOptions['TC']): PipelineStage.Lookup {
    return {
        '$lookup': {
            ...options
        }
    }
}

function fixDepth(depth: number, option: typeof lookupsOptions['TC']) {
    return Object.assign({}, option, {
        'localField': 'children.'.repeat(depth) + option.localField,
        'as': 'children.'.repeat(depth) + option.as
    }) as typeof option
}

function unwindStage(depth: number, name = 'children'): PipelineStage.Unwind {
    return {
        '$unwind': '$' + (name + '.').repeat(depth).slice(0, -1)
    }
}

function groupStage(groupObj: object | string, pushObj: object | string): PipelineStage.Group {
    return {
        '$group': {
            '_id': groupObj,
            'children': {
                '$push': pushObj
            }
        }
    }
}

function fixout(data: any) {

    return data.map((ele: any) => {
        return {
            id: ele._id,
            children: (ele.children) ? fixout(ele.children) : undefined
        }
    })
}

