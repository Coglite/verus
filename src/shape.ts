import { Validator, ValidateResult, ValidateFn, invalid, valid } from './common'
import { String, Number } from './type'
import { ShapeErrors } from './errors'
import * as kindOf from 'kind-of'
import { FluentValidator } from './fluent-validator'

export type ShapeFields<T> = {
    [P in keyof T]: Validator<T[P]>
}

export interface ShapeClass<T> extends Validator<T> {
    new (): T
}

export function Shape<T>(fields: ShapeFields<T>, allowExtraFields = true): ShapeClass<T> {
    class Shape {
        static async validate(value: any): Promise<ValidateResult<T>> {
            const o: Partial<T> = new this() as any
            let isValid = true
            let errors: ShapeErrors = {
                type: 'shape',
                name: 'Shape',
                shapeName: this.name,
                fields: {}
            }
            const shapeKeys = Object.keys(fields)
            for (const key of shapeKeys) {
                const r = await fields[key].validate(value[key])
                if (!r.valid) {
                    errors.fields[key] = r.errors
                    isValid = false
                } else if (isValid) {
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

            return isValid ? valid(o as T) : invalid(errors)
        }

        static or<U>(other: Validator<U>): Validator<T | U> {
            const name = `${this.name} | ${other.name}`
            const v = async (value: any): Promise<ValidateResult<T | U>> => {
                const ra = await this.validate(value)
                if (ra.valid) {
                    return ra as ValidateResult<T | U>
                } else {
                    const rb = await other.validate(value)
                    if (!rb.valid) {
                        return invalid({
                            type: 'or',
                            name,
                            left: ra.errors,
                            right: rb.errors,
                        })
                    }
                    return rb
                }
            }
            return new FluentValidator<T | U>(name, v)
        }

        static and<U>(other: Validator<U>): Validator<T & U> {
            const name = `${this.name} & ${other.name}`
            const v = async (value: any): Promise<ValidateResult<T & U>> => {
                const ra = await this.validate(value)
                if (ra.valid) {
                    const rb = await other.validate(ra.value)
                    if (rb.valid) {
                        return valid(rb.value as T & U)
                    } else {
                        return invalid({
                            type: 'and',
                            name,
                            right: rb.errors
                        })
                    }
                } else {
                    return invalid({
                        type: 'and',
                        name,
                        left: ra.errors
                    })
                }
            }

            return new FluentValidator<T & U>(name, v)
        }

        static get typeValue(): T {
            throw 'Do not call typeValue at runtime'
        }
    }
    return Shape as any
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
