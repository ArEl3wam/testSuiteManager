import express from 'express'; 
import {getTestSuiteModel} from '../model/TestSuite';
import { _idToid } from "../shared/utils";
import { AggregationWrapper } from "../services/AggregationWrapper";


export async function getTestSuiteById(request: express.Request, response: express.Response) {
    const id = request.params.id;
    try {
        const filter= {"_id": id};
        const testSuiteToSend: any = await getTestSuiteModel().findOne(filter);
        const transformedTestSuite =_idToid(testSuiteToSend.toJSON());
        return response.json(transformedTestSuite);
        
    } catch (err: any) {
        return response.status(500).json({ message: err.message });
    }
}

export async function getAllTestSuites(request: express.Request, response: express.Response) {
    try {
        const page: number = parseInt(request.query.page as string, 10) || 1;
        const limit: number = parseInt(request.query.limit as string, 10) || 100;
        let testSuites = await AggregationWrapper.getInstance(getTestSuiteModel().aggregate())
            .filter(request.query)
            .lookup("testcases", "testCaseRef", "_id")
            .count_project("TestCases", "testCaseRef")
            .paginate(page, limit)
            .getAggregation().exec();
        
        return response.json({
            status: 'success',
            resultsLength: testSuites.length,
            testSuites
        }
        );

    } catch (err: any) {
        response.status(500).json({ message: err.message });
    }
}

export async function addTestSuite(request: express.Request, response: express.Response) {
    try {
        const TestSuiteModel = getTestSuiteModel();
        const testSuite = new TestSuiteModel(request.body);
        const countDocuments: number = await TestSuiteModel.countDocuments();
        testSuite.incremental_id = countDocuments + 1;
        const newTestSuite = await testSuite.save();
        const transformedTestSuite = _idToid(newTestSuite.toJSON());

        return response.status(201).json(transformedTestSuite);
    } catch (err: any) {
        return response.status(400).json({ message: err.message });
    }   
}

export async function updateTestSuiteById(request: express.Request, response: express.Response) {
    const id = request.params.id;
    const filter= {"_id": id};
    const update = request.body;
    getTestSuiteModel().updateOne(filter, {$set:update}).then(() => {
        return response.status(200).json({ message: "TestSuite updated" });
    }).catch((err: any) => {
        return response.status(400).json({ message: err.message });
    });
}
export async function deleteTestSuiteById(request: express.Request, response: express.Response) {
    //TODO: delete all validation tags & test cases  associated with this test suite
    const id = request.params.id;
    try {
        const filter= {"_id": id};
        await getTestSuiteModel().deleteOne(filter);
        return response.status(200).json({ message: "TestSuite deleted" });
    } catch (err: any) {
        return response.status(500).json({ message: err.message });
    }
}