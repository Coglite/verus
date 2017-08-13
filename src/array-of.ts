import { Validator, ValidateResult } from './common'
import { FluentValidator } from './fluent-validator'
import { expect, invalid } from './common'
import { Errors } from './errors'

export function ArrayOf<T>(validator: Validator<T>): FluentValidator<T[]> {
    const name = `ArrayOf<${validator.name}>`
    const v = async (value: any): Promise<ValidateResult<T[]>> => {
        const kindResult = expect('array', value)
        if (kindResult.result === 'invalid') {
            return kindResult
        }

        const arr = value as Array<any>
        const validatedArr: T[] = []
        const invalidIndices: [number, Errors][] = []
        for (let i = 0; i < arr.length; i++) {
            const r = await validator.validate(arr[i])
            if (r.result === 'invalid') {
                invalidIndices.push([i, r.errors])
            } else if (invalidIndices.length === 0) {
                validatedArr.push(r.value)
            }
        }
        if (invalidIndices.length > 0) {
            return invalid({
                name,
                type: 'array',
                invalidIndices
            })
        }
        return {
            result: 'valid',
            value: validatedArr
        }
    }

    return new FluentValidator<T[]>(name, v)
}
