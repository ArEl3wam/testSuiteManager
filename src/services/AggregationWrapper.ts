export class AggregationWrapper{
    private static instance: AggregationWrapper;
    private aggregation: any;
    
    private constructor(aggregation: any) {
        this.aggregation = aggregation;
    }
    
    static getInstance(aggregation: any): AggregationWrapper {
        if (!AggregationWrapper.instance) {
            AggregationWrapper.instance = new AggregationWrapper(aggregation);
        } else {
            AggregationWrapper.instance.aggregation = aggregation;
        }
        return AggregationWrapper.instance;
    }

    lookup(from: string, localFieldName: string, foreignFieldName: string, as: string = localFieldName) {
        this.aggregation.lookup({
            from: from,
            localField: localFieldName,
            foreignField: foreignFieldName,
            as: as
        })
        return this ;
    }
    _count_project_util(refNmae: string, state : boolean) {
        return {
            "$size": {
                "$filter": {
                    "input": "$" + refNmae,
                    "as": "input",
                    "cond": { "$eq": ["$$input.status", state] }
                }
            }
        }
    }
    count_by_project(fieldName: string, refName: string) {
        let count_name: string = fieldName + "Count"
        let passed_count_name: string = "passed" + count_name
        let failed_count_name: string = "failed" + count_name
        this.aggregation.project({
            [count_name]: {$size: "$" + refName},
            [passed_count_name]: this._count_project_util(refName, true),
            [failed_count_name]: this._count_project_util(refName, false),
            _id: 1,
            parent: 1,
            metaData: 1,
            status: 1,
            creation_date: 1,
            end_date: 1,
            incrementalId: 1,
            
        })
        return this;
    }
    count_by_group(fieldName: string, refName: string) {
        this.unwind(refName)
        let count_name: string = fieldName + "Count"
        let passed_count_name: string = "passed" + count_name
        let failed_count_name: string = "failed" + count_name
        this.aggregation.group({
            _id: "$_id",
            parent: { $first: "$parent" },
            metaData: { $first: "$metaData" },
            status: { $first: "$status" },
            creation_date: { $first: "$creation_date" },
            end_date: { $first: "$end_date" },
            incrementalId: { $first: "$incrementalId" },
            [count_name]: { $sum: 1 },
            [passed_count_name]: {
                $sum: { $cond: [{ $eq: ["$" + refName + ".status", true] }, 1, 0] },
            },
            [failed_count_name]: {
                $sum: { $cond: [{ $eq: ["$" + refName + ".status", false] }, 1, 0] },
            },
        })
        return this;
    }

    filter(query: any) {
        let temp_query = JSON.parse(JSON.stringify(query));
        const exculudeFields = ["page", "limit", "sort", "databaseName"];
        for (let key in temp_query) {
            if (exculudeFields.includes(key)) {
                delete temp_query[key];
            }
        }
        this.aggregation.match(temp_query)
        return this;
    }
    match(query: any) {
        this.aggregation.match(query)
        return this;
    }
    unwind(localFieldName: string) {
        this.aggregation.unwind(localFieldName)
        return this;
    }
    project(query: any = {_id : 0}) {
        this.aggregation.project(query)
        return this;
    }
    addFields(query: any) {
        this.aggregation.addFields(query)
        return this;
    }
    group(query: any) {
        this.aggregation.group(query)
        return this;
        
    }
    
    sort(sort: any = {}) {
        if (!sort) {
            return this;
        }
        this.aggregation.sort(sort)
        return this;
    }
    paginate(page: any = 1, limit: any = 100)
    {   
        const skip = (page - 1) * limit;
        this.aggregation.skip(skip).limit(limit);
        return this;
    }

    getAggregation() {
        return this.aggregation
    }

}


