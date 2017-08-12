import * as kindOf from 'kind-of'
import { Errors } from './errors'

export type Kind =
      'undefined'
    | 'null'
    | 'boolean'
    | 'buffer'
    | 'number'
    | 'string'
    | 'arguments'
    | 'object'
    | 'date'
    | 'array'
    | 'regexp'
    | 'function'
    | 'generatorfunction'
    | 'promise'
    | 'map'
    | 'weakmap'
    | 'set'
    | 'symbol'
    | 'int8array'
    | 'uint8array'
    | 'uint8clampedarray'
    | 'int16array'
    | 'uint16array'
    | 'int32array'
    | 'uint32array'
    | 'float32array'
    | 'float64array'

export interface Valid<T> {
    result: 'valid'
    value: T
}

export interface Invalid<T> {
    result: 'invalid'
    errors: Errors
}

export type ValidateResult<T> = Valid<T>|Invalid<T>
export type ValidateFn<T> = (value: any) => Promise<ValidateResult<T>>

export interface Validator<T> {
    name: string;
    validate(value: any): Promise<ValidateResult<T>>
}

export function expect(kind: Kind, value: any): ValidateResult<any> {
    const k = kindOf(value)
    if (k != kind) {
        return {
            result: 'invalid',
            errors: {
                type: 'type',
                expected: kind,
                actual: k
            }
        }
    }
    return {
        result: 'valid',
        value
    }
}

export function typeValue<T>(v: Validator<T>): T {
    return undefined as any
}
