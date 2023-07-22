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

    search_lookup(collectionName: string, localFieldName: string) {
        this.aggregation.lookup({
            from: collectionName,
            localField: "parent."+localFieldName+".id",
            foreignField: "_id",
            as: localFieldName
        })
        return this;
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
    count_project(fieldName: string, refName: string) {
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
            
        })
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

    search_project(localFieldName: string = "") {
        localFieldName = this._modifyLocalName(localFieldName)

        const projection: any = {}
        const fields: string[] = ['parent', '__v', 'validationPointRefs', 'validationTagRefs', 'testCaseRef'];
        fields.forEach(field => projection[localFieldName + field] = 0)
        this.aggregation.project(projection)
        return this;
    }
    
    search_match(query: any, localFieldName: string = "") {
        if (!query) {
            return this;
        }
        const match = this.flattenQueryObject(query,localFieldName);
        
        this.aggregation.match(match)
        
        return this;
    }

    flattenQueryObject(query_obj: any, parentKey = ''): any {
        // the desire of this function to transfer the object to the form of {parentKey.key: value}
        // example {a: {b: 1}} => {'a.b': 1}, {a: {b: {c: 1}}} => {'a.b.c': 1}
        // this is needed for the correct operation of the match function
        let result: any = {};

        for (let key in query_obj) {
            if (query_obj.hasOwnProperty(key)) {
            const propName = parentKey ? `${parentKey}.${key}` : key;

            if (typeof query_obj[key] === 'object' && query_obj[key] !== null) {
                const nestedObj = this.flattenQueryObject(query_obj[key], propName);
                result = { ...result, ...nestedObj };
            } else {
                result[propName] = query_obj[key];
            }
            }
        }

        return result;
    }

    sort(sort: any = {}) {
        if (!sort) {
            return this;
        }
        sort = sort.split(",").join(" ");
        this.aggregation.sort(sort)
        return this;
    }
    group(query: any) {
        this.aggregation.group(query)
        return this;
        
    }
    paginate(page: any = 1, limit: any = 100) {
        const skip = (page - 1) * limit;
        this.aggregation.skip(skip).limit(limit);
        return this;
    }

    getAggregation() {
        return this.aggregation
    }

    _modifyLocalName(localFieldName: string) {
        if (localFieldName) {
            localFieldName = localFieldName + "."
        }
        return localFieldName
    }
}


