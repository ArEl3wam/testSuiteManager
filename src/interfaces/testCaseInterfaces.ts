import { ListingOptions } from "./listingInterfaces";


export interface TestCaseInsertion {
    metaData?: object,
    status?: boolean,
}

export interface TestCaseListingOptions extends ListingOptions{
    name?: string
    testSuite?: {
        id?: string
    }
}

export interface TestCaseUpdate {
    status?: boolean
}