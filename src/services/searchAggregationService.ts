export class AggregationFeatures{
    private static instance: AggregationFeatures;
    private aggregation: any;
    
    private constructor(aggregation: any) {
        this.aggregation = aggregation;
    }
    
    static getInstance(aggregation: any): AggregationFeatures {
        if (!AggregationFeatures.instance) {
            AggregationFeatures.instance = new AggregationFeatures(aggregation);
        } else {
            AggregationFeatures.instance.aggregation = aggregation;
        }
        return AggregationFeatures.instance;
    }

    lookUP(collectionName: string, localFieldName: string) {
        this.aggregation.lookup({
            from: collectionName,
            localField: "parent."+localFieldName+".id",
            foreignField: "_id",
            as: localFieldName
        })
        return this;
    }

    project(localFieldName: string = "") {
        localFieldName = this._modifyLocalName(localFieldName)

        const projection: any = {}
        const fields: string[] = ['parent', '__v', 'validationPointRefs', 'validationTagRefs', 'testCaseRef'];
        fields.forEach(field => projection[localFieldName + field] = 0)
        this.aggregation.project(projection)
        return this;
    }
    
    match(query: any, localFieldName: string = "") {
        if (!query) {
            return this;
        }
        const match = this.flattenObject(query,localFieldName);
        
        this.aggregation.match(match)
        
        return this;
    }

    flattenObject(obj: any, parentKey = ''): any {
        let result: any = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
            const propName = parentKey ? `${parentKey}.${key}` : key;

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const nestedObj = this.flattenObject(obj[key], propName);
                result = { ...result, ...nestedObj };
            } else {
                result[propName] = obj[key];
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
    group(selectedView: any) {
        // if (!selectedView || selectedView.toLowerCase() === "vp") {
        //     return this;
        // }
        // this.aggregation.group({
        //     _id: `$${selectedView}._id`,
        //     children: { $push: "$$ROOT" }
        //     }
        // )
        // return this;
        
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


