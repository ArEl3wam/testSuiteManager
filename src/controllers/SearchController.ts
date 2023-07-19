import express from 'express'
import { AggregationFeatures } from '../services/AggregationService'
import { validationPointModel } from "../model/ValidationPoint";
import validationTagModel from "../model/ValidationTag";
import { testSuiteModel } from "../model/TestSuite";
import testCaseModel from "../model/TestCase";

import mongoose from 'mongoose';


export async function SearchingResources(req: express.Request, res: express.Response) {
    try {

        // TODO : refactor this code , and make it more generic
        const test_suite_filters = await testSuiteModel
            .aggregate()
            .group({
                _id: null,
                owner: { $addToSet: "$metaData.owner" },
                version: { $addToSet: "$metaData.version" },
                machine: { $addToSet: "$metaData.machine" },
                compilation_mode: { $addToSet: "$metaData.compilation_mode" },
                platform: { $addToSet: "$metaData.platform" },
                solution: { $addToSet: "$metaData.solution" },
                tool_name: { $addToSet: "$metaData.tool_name" },
                status: { $addToSet: "$status" },
                // mii_enum: { $addToSet: "$metaData.design_info.dut_instance_info.sa_configuration.mii_enum" }

            })
            .project({
                _id: 0,
            })
        
        const test_case_filters = await testCaseModel
            .aggregate()
            .group({
                _id: null,
                status: { $addToSet: "$status" },
            })
            .project({
                _id: 0,
            })
        const validation_tag_filters = await validationTagModel
            .aggregate()
            .group({
                _id: null,
                name : { $addToSet: "$metaData.name" },
                executable_path: { $addToSet: "$metaData.metaData.Executable Path"},
                status: { $addToSet: "$status" },
            })
            .project({
                _id: 0,
            })
        const validation_point_filters = await validationPointModel
            .aggregate()
            .group({
                _id: null,
                status: { $addToSet: "$status" },
                mac: { $addToSet: "$levels.mac" },
                direction: { $addToSet: "$levels.direction" },
                packet_identifier: { $addToSet: "$levels.packet_identifier" },
            })
        
        const data = {
            test_suites: test_suite_filters[0],
            test_cases: test_case_filters[0],
            validation_tag: validation_tag_filters[0],
            validation_point: validation_point_filters[0]
        }
        
        // results[0].mii_enum.forEach((element: any) => {
        //     console.log(element)
        // });
        
        
        // let aggregateFeatures = AggregationFeatures.getInstance(validationPointModel.aggregate())
        // aggregateFeatures
        //     .search_lookup("validationtags", "validationTag")
        //     .search_lookup("testcases", "testCase")
        //     .search_match(req.query.vp)
        //     .search_match(req.query.vt, "validationTag")
        //     .search_match(req.query.tc, "testCase")
        //     .search_project()
        //     .search_project("validationTag")
        //     .search_project("testCase")
        //     // .group(req.query.select)
        //     .paginate(req.query.page,req.query.limit)
        // const results = await aggregateFeatures.getAggregation().exec()

        res.status(200).json({ 
            status: 'success',
            data
         })
    } catch (err: unknown) {
        console.log(err)
        res.status(400).send('Bad Request')
    }
}