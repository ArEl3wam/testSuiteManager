import { Types } from "mongoose"

export function _idToid<T extends { _id: Types.ObjectId } >(resource: T): Omit<T, '_id'> & { 'id': Types.ObjectId }  {

    const { _id, ...otherProps } = resource

    return Object.assign(otherProps, {
        id: _id
    }) as T & { id: Types.ObjectId }

}

// Convert a nested object to a flattened object with dot notation
export function flattenObject(obj: object, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key as keyof typeof obj] === 'object') {
            Object.assign(acc, flattenObject(obj[key as keyof typeof obj], newKey));
        } else {
            acc[newKey as keyof typeof obj] = obj[key as keyof typeof obj];
        }
        return acc;
    }, {});
}

export function removeAttributes<T, K extends keyof T> (obj: T, attrs: K[]): Omit<T, K> {
    for(let i = 0; i < attrs.length; i++) {
        delete  obj[attrs[i]]
    }
    return obj
}