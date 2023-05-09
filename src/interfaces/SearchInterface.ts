export type ResourceTypes = 'VP' | 'VT' | 'TS' | 'TC'

export interface SearchFilter {
    TS: {
        
        isSuccessful: boolean
    }

    TC: {

        isSuccessful: boolean
    }

    VT: {

        isSuccessful: boolean
    }

    VP: {

        isSuccessful: boolean
    }
}


export interface SearchOptions {
    filteration: DeepPartial<SearchFilter>
    select: ResourceTypes
}


type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;