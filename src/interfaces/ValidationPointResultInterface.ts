export interface ValidationPointResultInterface {
    name: string,
    status:'pass' | 'fail',
    expected:any,
    actual:any,
    tolerance:any,
}

export interface ValidationPointUpdate {
    isSuccessful: boolean
}