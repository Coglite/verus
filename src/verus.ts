import * as parseDate from 'date-fns/parse'
import * as isValidDate from 'date-fns/is_valid'
import * as kindOf from 'kind-of'

export interface Valid<T> {
    result: 'valid'
    value: T
}

type Errors = { [key: string]: Errors } | string

export interface AndErrors {
    type: 'and'
    right?: string
    left?: string
}

export interface OrErrors {
    type: 'or'
    right?: string
    left?: string
}

export interface Invalid<T> {
    result: 'invalid'
    errors: Errors
}

export type ValidateResult<T> = Valid<T>|Invalid<T>

export type Validate<T> = ValidateFn<T>|Validator<T>

export type ValidateFn<T> = (value: any) => ValidateResult<T>

export interface Validator<T> {
    name: string;
    validate(value: any): ValidateResult<T>
}

export class FluentValidator<T> implements Validator<T> {
    constructor(
        public readonly name: string,
        public readonly validate: ValidateFn<T>) {}

    and<U>(other: Validator<U>): FluentValidator<T & U> {
        const v = this.validate
        const next = (value: any): ValidateResult<T & U> => {
            const ra = v(value)
            if (ra.result === 'valid') {
                const rb = other.validate(ra.value)
                if (rb.result === 'valid') {
                    return {
                        result: 'valid',
                        value: rb.value as T&U
                    }
                } else {
                    return {
                        result: 'invalid',
                        errors: {
                            right: rb.errors
                        }
                    }
                }
            } else {
                return {
                    result: 'invalid',
                    errors: {
                        left: ra.errors
                    }
                }
            }
        }

        return new FluentValidator<T & U>(`${this.name} & ${other.name}`, next)
    }
}

export type ShapeFields<T> = {
    [P in keyof T]: Validator<T[P]>
}

export const Type = <T>(name: string, typeName: KindOf) => new FluentValidator<T>(name, (value: any) => {
    const type = kindOf(value)
    if (type !== typeName) {
        return {
            result: 'invalid',
            errors: ` was not ${typeName}, but ${type}`
        }
    }
    return {
        result: 'valid',
        value
    }
})

export const String = Type<string>('String', 'string')
export const Number = Type<number>('Number', 'number')
export const Boolean = Type<boolean>('Boolean', 'boolean')
export const Symbol = Type<symbol>('Symbol', 'symbol')
export const Undefined = Type<undefined>('Undefined', 'undefined')
export const Obj = Type<object>('Object', 'object')
export const Func = Type<Function>('Function', 'function')

export function Shape<T>(fields: ShapeFields<T>, allowExtraFields = true): FluentValidator<T> {
    const v = (value: any): ValidateResult<T> => {
        const o: Partial<T> = {}
        let valid = true
        let errors: Errors = {}
        const shapeKeys = Object.keys(fields)
        for (const key of shapeKeys) {
            const r = callValidate(fields[key], value[key])
            if (r.result === 'invalid') {
                errors[key] = r.errors
                valid = false
            } else if (valid) {
                o[key] = r.value
            }
        }
        const diff = difference(shapeKeys, Object.keys(value))
        if (allowExtraFields) {
            for (const key of diff) {
                o[key] = value[key]
            }
        } else if (diff.length > 0) {
            const extraFields: any = {}
            for (const key of diff) {
                extraFields[key] = ` with type ${kindOf(value[key])} not defined in shape`
            }
            return {
                result: 'invalid',
                errors: {
                    ...errors,
                    ...extraFields
                }
            }
        }

        return valid ? { result: 'valid', value: o as T} : {result: 'invalid', errors}
    }
    return new FluentValidator<T>('Shape', v)
}

export const ISODate = String.and(new FluentValidator<Date>('ISODate', value => {
    const date = parseDate(value)
    if (!isValidDate(date)) {
        return {
            result: 'invalid',
            errors: ' is not a valid Date'
        }
    }
    return {
        result: 'valid',
        value: date
    }
}))

function difference(a: string[], b: string[]): string[] {
    const diff = []
    for (const vb of b) {
        if (a.indexOf(vb) === -1) {
            diff.push(vb)
        }
    }
    return diff
}

function callValidate<T>(v: Validate<T>, value: any): ValidateResult<T> {
    const a: any = v
    if (typeof a.validate === 'function') {
        return a.validate(value)
    } else {
        return a(value)
    }
}

function typeValue<T>(v: Validate<T>): T {
    return undefined as any
}