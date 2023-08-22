import mongoose from "mongoose";
import express from "express";
import { AggregationWrapper } from "../services/AggregationWrapper";
import { getValidationPointModel } from "../model/ValidationPoint";
import {getValidationTagModel} from "../model/ValidationTag";
import { getTestSuiteModel } from "../model/TestSuite";
import {getTestCaseModel} from "../model/TestCase";

function testSuiteMatchGenerator(query: any, prefix: string = "") {
  prefix = prefix ? prefix + "." : "";
  const testSuiteIdMatch = query._id.length
    ? {
        [prefix + "_id"]: {
          $in: query._id.map((e: any) => new mongoose.Types.ObjectId(e)),
        },
      }
    : {};

  const ownerMatch = query.owner.length
    ? { [prefix + "metaData.owner"]: { $in: query.owner } }
    : {};

  const versionMatch = query.version.length
    ? { [prefix + "metaData.version"]: { $in: query.version } }
    : {};

  const machineMatch = query.machine.length
    ? { [prefix + "metaData.machine"]: { $in: query.machine } }
    : {};

  const compilationModeMatch = query.compilation_mode.length
    ? {
        [prefix + "metaData.compilation_mode"]: { $in: query.compilation_mode },
      }
    : {};

  const platformMatch = query.platform.length
    ? { [prefix + "metaData.platform"]: { $in: query.platform } }
    : {};

  const solutionMatch = query.solution.length
    ? { [prefix + "metaData.solution"]: { $in: query.solution } }
    : {};

  const toolNameMatch = query.tool_name.length
    ? { [prefix + "metaData.tool_name"]: { $in: query.tool_name } }
    : {};

  const statusMatch = query.status.length
    ? { [prefix + "status"]: { $in: query.status } }
    : {};

  const incrementalId = query.incrementalId.length
    ? { [prefix + "incrementalId"]: { $in: query.incrementalId } }
    : {};

  return {
    ...testSuiteIdMatch,
    ...ownerMatch,
    ...versionMatch,
    ...machineMatch,
    ...compilationModeMatch,
    ...platformMatch,
    ...solutionMatch,
    ...toolNameMatch,
    ...statusMatch,
    ...incrementalId,
  };
}

function testCaseMatchGenerator(query: any, prefix: string = "") {
  prefix = prefix ? prefix + "." : "";
  const testCaseIdMatch = query._id.length
    ? {
        [prefix + "_id"]: {
          $in: query._id.map((e: any) => new mongoose.Types.ObjectId(e)),
        },
      }
    : {};
  const testCaseStatusMatch = query.status.length
    ? { [prefix + "status"]: { $in: query.status } }
    : {};
  const incrementalId = query.incrementalId.length
    ? { [prefix + "incrementalId"]: { $in: query.incrementalId } }
    : {};
  return {
    ...testCaseIdMatch,
    ...testCaseStatusMatch,
    ...incrementalId,
  };
}

function validationTagMatchGenerator(query: any, prefix: string = "") {
  prefix = prefix ? prefix + "." : "";
  const validationTagIdMatch = query._id.length
    ? {
        [prefix + "_id"]: {
          $in: query._id.map((e: any) => new mongoose.Types.ObjectId(e)),
        },
      }
    : {};

  const validationTagNameMatch = query.name.length
    ? { [prefix + "metaData.name"]: { $in: query.name } }
    : {};

  const validationTagStatusMatch = query.status.length
    ? { [prefix + "status"]: { $in: query.status } }
    : {};

  return {
    ...validationTagIdMatch,
    ...validationTagNameMatch,
    ...validationTagStatusMatch,
  };
}

function validationPointMatchGenerator(query: any, prefix: string = "") {
  prefix = prefix ? prefix + "." : "";
  const validationPointIdMatch = query._id.length
    ? {
        [prefix + "_id"]: {
          $in: query._id.map((e: any) => new mongoose.Types.ObjectId(e)),
        },
      }
    : {};

  const validationPointStatusMatch = query.status.length
    ? { [prefix + "status"]: { $in: query.status } }
    : {};

  const validationPointMacMatch = query.mac.length
    ? { [prefix + "levels.mac"]: { $in: query.mac } }
    : {};

  const validationPointDirectionMatch = query.direction.length
    ? { [prefix + "levels.direction"]: { $in: query.direction } }
    : {};

  const validationPointPacketIdentifierMatch = query.packet_identifier.length
    ? { [prefix + "levels.packet_identifier"]: { $in: query.packet_identifier },}
    : {};
  
  const incrementalId = query.incrementalId.length
    ? { [prefix + "incrementalId"]: { $in: query.incrementalId } }
    : {};

  return {
    ...validationPointIdMatch,
    ...validationPointStatusMatch,
    ...validationPointMacMatch,
    ...validationPointDirectionMatch,
    ...validationPointPacketIdentifierMatch,
    ...incrementalId,
  };
}

export async function testSuiteAggregationBuilder(req: express.Request) {
  // leh bn3ml look up l awl ?
  // 3shan el lookup by3ml join bs bybdl l attrbiute be list
  // fa lw unwind l awl, l lookup b3deha htgenerate list of list [ [] , [] , [] ]
  const databaseName= req.query.databaseName;
  const results = await AggregationWrapper.getInstance(
    getTestSuiteModel(databaseName).aggregate()
  )
    .match(testSuiteMatchGenerator(req.body.testSuites))
    .lookup("testcases", "testCaseRef", "_id")
    .unwind("testCaseRef")
    .match(testCaseMatchGenerator(req.body.testCases, "testCaseRef"))
    .lookup("validationtags", "testCaseRef.validationTagRefs", "_id")
    .unwind("testCaseRef.validationTagRefs")
    .match(
      validationTagMatchGenerator(
        req.body.validationTags,
        "testCaseRef.validationTagRefs"
      )
    )
    .lookup(
      "validationpoints",
      "testCaseRef.validationTagRefs.validationPointRefs",
      "_id"
    )
    .unwind("testCaseRef.validationTagRefs.validationPointRefs")
    .match(
      validationPointMatchGenerator(
        req.body.validationPoints,
        "testCaseRef.validationTagRefs.validationPointRefs"
      )
    )
    .group({
      _id: "$_id",
      metaData: { $first: "$metaData" },
      status: { $first: "$status" },
      testCaseRef: { $addToSet: "$testCaseRef._id" },
      creation_date: { $first: "$creation_date" },
      end_date: { $first: "$end_date" },
      incrementalId: { $first: "$incrementalId" },
    })
    .lookup("testcases", "testCaseRef", "_id")
    .count_by_project("TestCases", "testCaseRef")
    .filter(req.query)
    .paginate(req.query.page, req.query.limit)
    .addFields({ "metaData.id": "$_id" })
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  return results;
}

export async function testCaseAggregationBuilder(req: express.Request) {
  const databaseName= req.query.databaseName;
  const results = await AggregationWrapper.getInstance(
    getTestCaseModel(databaseName).aggregate()
  )
    .match(testCaseMatchGenerator(req.body.testCases))
    .lookup("validationtags", "validationTagRefs", "_id")
    .unwind("validationTagRefs")
    .match(
      validationTagMatchGenerator(req.body.validationTags, "validationTagRefs")
    )
    .lookup("validationpoints", "validationTagRefs.validationPointRefs", "_id")
    .unwind("validationTagRefs.validationPointRefs")
    .match(
      validationPointMatchGenerator(
        req.body.validationPoints,
        "validationTagRefs.validationPointRefs"
      )
    )
    .group({
      _id: "$_id",
      metaData: { $first: "$metaData" },
      parent: { $first: "$parent" },
      status: { $first: "$status" },
      validationTagRefs: { $addToSet: "$validationTagRefs._id" },
      creation_date: { $first: "$creation_date" },
      end_date: { $first: "$end_date" },
      incrementalId: { $first: "$incrementalId" },

    })
    .lookup("testsuites", "parent.testSuite.id", "_id", "parent.testSuite")
    .match(testSuiteMatchGenerator(req.body.testSuites, "parent.testSuite"))
    .lookup("validationtags", "validationTagRefs", "_id")
    .count_by_project("ValidationTags", "validationTagRefs")
    .filter(req.query)
    .paginate(req.query.page, req.query.limit)
    .unwind("parent.testSuite")
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  return results;
}
export async function validationTagAggregationBuilder(req: express.Request) {
  const databaseName= req.query.databaseName;
  const results = await AggregationWrapper.getInstance(
    getValidationTagModel(databaseName).aggregate()
  )
    .match(validationTagMatchGenerator(req.body.validationTags))
    .lookup("validationpoints", "validationPointRefs", "_id")
    .unwind("validationPointRefs")
    .match(
      validationPointMatchGenerator(
        req.body.validationPoints,
        "validationPointRefs"
      )
    )
    .group({
      _id: "$_id",
      metaData: { $first: "$metaData" },
      parent: { $first: "$parent" },
      status: { $first: "$status" },
      validationPointRefs: { $addToSet: "$validationPointRefs._id" },
      creation_date: { $first: "$creation_date" },
      end_date: { $first: "$end_date" },
    })
    .lookup("testcases", "parent.testCase.id", "_id", "parent.testCase")
    .match(testCaseMatchGenerator(req.body.testCases, "parent.testCase"))
    .lookup("testsuites", "parent.testSuite.id", "_id", "parent.testSuite")
    .match(testSuiteMatchGenerator(req.body.testSuites, "parent.testSuite"))
    .filter(req.query)
    .lookup("validationpoints", "validationPointRefs", "_id")
    .count_by_project("ValidationPoints", "validationPointRefs")
    .paginate(req.query.page, req.query.limit)
    .unwind("parent.testSuite")
    .unwind("parent.testCase")
    .getAggregation()
    .exec();

  return results;
}
export async function validationPointAggregationBuilder(req: express.Request) {
  // we need to make it faster as much as possible
  const databaseName= req.query.databaseName;
  const results = await AggregationWrapper.getInstance(
    getValidationPointModel(databaseName).aggregate()
  )
    .match(validationPointMatchGenerator(req.body.validationPoints))
    .lookup(
      "validationtags",
      "parent.validationTag.id",
      "_id",
      "parent.validationTag"
    )
    .match(
      validationTagMatchGenerator(
        req.body.validationTags,
        "parent.validationTag"
      )
    )
    .unwind("parent.validationTag")
    .lookup("testcases", "parent.testCase.id", "_id", "parent.testCase")
    .match(testCaseMatchGenerator(req.body.testCases, "parent.testCase"))
    .unwind("parent.testCase")
    .lookup("testsuites", "parent.testSuite.id", "_id", "parent.testSuite")
    .match(testSuiteMatchGenerator(req.body.testSuites, "parent.testSuite"))
    .unwind("parent.testSuite")
    .filter(req.query)
    .paginate(req.query.page, req.query.limit)
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  return results;
}

export async function filtersBuilder(databaseName: any) {
  
  const test_suite_filters = await AggregationWrapper.getInstance(
    getTestSuiteModel(databaseName).aggregate()
  )
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
      incrementalId: { $addToSet: "$incrementalId" },
    })
    .project()
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  const test_case_filters = await AggregationWrapper.getInstance(
    getTestCaseModel(databaseName).aggregate()
  )
    .group({
      _id: null,
      status: { $addToSet: "$status" },
      incrementalId: { $addToSet: "$incrementalId" },
    })
    .project()
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  const validation_tag_filters = await AggregationWrapper.getInstance(
    getValidationTagModel(databaseName).aggregate()
  )
    .group({
      _id: null,
      name: { $addToSet: "$metaData.name" },
      status: { $addToSet: "$status" },
    })
    .project()
    .getAggregation()
    .exec();

  const validation_point_filters = await AggregationWrapper.getInstance(
    getValidationPointModel(databaseName).aggregate()
  )
    .group({
      _id: null,
      status: { $addToSet: "$status" },
      mac: { $addToSet: "$levels.mac" },
      direction: { $addToSet: "$levels.direction" },
      packet_identifier: { $addToSet: "$levels.packet_identifier" },
      incrementalId: { $addToSet: "$incrementalId" },
    })
    .project()
    .sort({"incrementalId": 1})
    .getAggregation()
    .exec();

  return {
    test_suites: test_suite_filters[0],
    test_cases: test_case_filters[0],
    validation_tag: validation_tag_filters[0],
    validation_point: validation_point_filters[0],
  };
}
