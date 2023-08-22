import express from "express";
import { getTestSuiteModel } from "../model/TestSuite";
import { _idToid } from "../shared/utils";
import { AggregationWrapper } from "../services/AggregationWrapper";
import { getTestCaseModel } from "../model/TestCase";
import { getValidationTagModel } from "../model/ValidationTag";
import { getValidationPointModel } from "../model/ValidationPoint";

export async function getTestSuiteById(
  request: express.Request,
  response: express.Response
) {
  const id = request.params.id;
  const databaseName = request.query.databaseName;
  try {
    const filter = { _id: id };
    const testSuiteToSend: any = await getTestSuiteModel(databaseName).findOne(
      filter
    );
    const transformedTestSuite = _idToid(testSuiteToSend.toJSON());
    return response.json(transformedTestSuite);
  } catch (err: any) {
    return response.status(500).json({ message: err.message });
  }
}

export async function getAllTestSuites(
  request: express.Request,
  response: express.Response
) {
  try {
    const databaseName = request.query.databaseName;
    const page: number = parseInt(request.query.page as string, 10) || 1;
    const limit: number = parseInt(request.query.limit as string, 10) || 100;
    let testSuites = await AggregationWrapper.getInstance(
      getTestSuiteModel(databaseName).aggregate()
    )
      .filter(request.query)
      .lookup("testcases", "testCaseRef", "_id")
      .count_by_group("TestCases", "testCaseRef")
      .paginate(page, limit)
      .getAggregation()
      .exec();

    return response.json({
      status: "success",
      resultsLength: testSuites.length,
      testSuites,
    });
  } catch (err: any) {
    response.status(500).json({ message: err.message });
  }
}

export async function addTestSuite(
  request: express.Request,
  response: express.Response
) {
  try {
    const databaseName = request.query.databaseName;
    const TestSuiteModel = getTestSuiteModel(databaseName);
    const testSuite = new TestSuiteModel(request.body);
    const HighestIncrementalIdObj = await TestSuiteModel.find().sort({ incrementalId: -1 }).limit(1);
    const incrementalID: number = HighestIncrementalIdObj[0]?.incrementalId !== undefined ? HighestIncrementalIdObj[0].incrementalId + 1 : 1;
    testSuite.incrementalId = incrementalID;
    const newTestSuite = await testSuite.save();
    const transformedTestSuite = _idToid(newTestSuite.toJSON());

    return response.status(201).json(transformedTestSuite);
  } catch (err: any) {
    return response.status(400).json({ message: err.message });
  }
}

export async function updateTestSuiteById(
  request: express.Request,
  response: express.Response
) {
  const databaseName = request.query.databaseName;
  const id = request.params.id;
  const filter = { _id: id };
  const update = request.body;
  getTestSuiteModel(databaseName)
    .updateOne(filter, { $set: update })
    .then(() => {
      return response.status(200).json({ message: "TestSuite updated" });
    })
    .catch((err: any) => {
      return response.status(400).json({ message: err.message });
    });
}

export async function deleteTestSuiteById(
  request: express.Request,
  response: express.Response
) {
  const id = request.params.id;
  const databaseName = request.query.databaseName;
  const TestSuite = getTestSuiteModel(databaseName);
  const TestCase = getTestCaseModel(databaseName);
  const ValidationTag = getValidationTagModel(databaseName);
  const ValidationPoint = getValidationPointModel(databaseName);

  await Promise.all([
    TestSuite.findByIdAndDelete(id),
    TestCase.deleteMany({ "parent.testSuite.id": id }),
    ValidationTag.deleteMany({ "parent.testSuite.id": id }),
    ValidationPoint.deleteMany({ "parent.testSuite.id": id }),
  ]);

  return response
    .status(200)
    .json({ status: "success", message: "TestSuite deleted" });
}
