import * as kindOf from 'kind-of'
import { Errors, errorMessage } from './errors'

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
    valid: true
    value: T
}

export interface Invalid<T> {
    valid: false
    errors: Errors
    message: string
}

export function invalid<T>(errors: Errors): Invalid<T> {
    return {
        valid: false,
        errors,
        get message() {
            return errorMessage(this.errors)
        }
    }
}

export function valid<T>(value: T): Valid<T> {
    return {
        valid: true,
        value
    }
}

export type ValidateResult<T> = Valid<T> | Invalid<T>
export type ValidateFn<T> = (value: any) => Promise<ValidateResult<T>>

export interface Validator<T> {
    name: string;
    validate(value: any): Promise<ValidateResult<T>>
    or<U>(validator: Validator<U>): Validator<T|U>
    and<U>(validator: Validator<U>): Validator<T&U>
}

export function expect(kind: Kind, value: any): ValidateResult<any> {
    const k = kindOf(value)
    if (k != kind) {
        return invalid({
            type: 'type',
            name: 'expect',
            expected: kind,
            actual: k
        })
    }
    return valid(value)
}

export function typeValue<T>(v: Validator<T>): T {
    return undefined as any
}
