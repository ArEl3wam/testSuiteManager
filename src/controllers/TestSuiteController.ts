import express from 'express';
const testSuiteModel = require('../model/TestSuite').testSuiteModel;
import { _idToid } from "../shared/utils";


export async function getTestSuiteById(request: express.Request, response: express.Response) {
    const id = request.params.id;
    try {
        const filter= {"_id": id};
        const testSuiteToSend = await testSuiteModel.findOne(filter);
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
        let queryObject: {[key: string]: any} = {
            "status": request.query.status || "",
            'metaData.name': request.query.name || "",
            "metaData.executablePath": request.query.executablePath || "",
            "metaData.author": request.query.author || ""
        };
        for (let key in queryObject) {
            if (!queryObject[key]) {
                delete queryObject[key];
            }
        }
        const testSuites = await testSuiteModel.find(queryObject)
        .skip((page - 1) * limit)
        .limit(limit);

        const transformedTestSuites = testSuites.map((ts:typeof testSuiteModel) => _idToid<typeof testSuiteModel>(ts.toJSON()));
        return response.json(transformedTestSuites);

    } catch (err: any) {
        response.status(500).json({ message: err.message });
    }
}

export async function addTestSuite(request: express.Request, response: express.Response) {
    try {
        const testSuite = await new testSuiteModel(request.body);
        const newTestSuite = await testSuite.save();
        const transformedTestSuite =_idToid(newTestSuite.toJSON());

        return response.status(201).json(transformedTestSuite);
    } catch (err: any) {
        return response.status(400).json({ message: err.message });
    }   
}

export async function updateTestSuiteById(request: express.Request, response: express.Response) {
    const id = request.params.id;
    const filter= {"_id": id};
    const update = request.body;
    testSuiteModel.updateOne(filter, {$set:update}).then(() => {
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
        await testSuiteModel.deleteOne(filter);
        return response.status(200).json({ message: "TestSuite deleted" });
    } catch (err: any) {
        return response.status(500).json({ message: err.message });
    }
}