import { Validator, ValidateResult, invalid } from './common'
import { FluentValidator } from './fluent-validator'
import * as kindOf from 'kind-of'
import { ShapeErrors } from './errors'

export type ShapeFields<T> = {
    [P in keyof T]: Validator<T[P]>
}

export function Shape<T>(shapeName: string, fields: ShapeFields<T>, allowExtraFields = true): FluentValidator<T> {
    const v = async (value: any): Promise<ValidateResult<T>> => {
        const o: Partial<T> = {}
        let valid = true
        let errors: ShapeErrors = {
            type: 'shape',
            name: 'Shape',
            shapeName: shapeName,
            fields: {}
        }
        const shapeKeys = Object.keys(fields)
        for (const key of shapeKeys) {
            const r = await fields[key].validate(value[key])
            if (r.result === 'invalid') {
                errors.fields[key] = r.errors
                valid = false
            } else if (valid) {
                o[key] = r.value
            }
        }
        const extraKeys = difference(shapeKeys, Object.keys(value))
        if (allowExtraFields) {
            for (const key of extraKeys) {
                o[key] = value[key]
            }
        } else if (extraKeys.length > 0) {
            errors.extra = {}
            for (const key of extraKeys) {
                errors.extra[key] = kindOf(value[key])
            }
            return invalid(errors)
        }

        return valid ? { result: 'valid', value: o as T} : invalid(errors)
    }
    return new FluentValidator<T>(`Shape(${shapeName})`, v)
}

function difference(a: string[], b: string[]): string[] {
    const diff = []
    for (const vb of b) {
        if (a.indexOf(vb) === -1) {
            diff.push(vb)
        }
    }
    return diff
}
