import { Validator, ValidateFn, ValidateResult, invalid, valid } from './common'

export class FluentValidator<T> implements Validator<T> {
    constructor(
        public readonly name: string,
        public readonly validate: ValidateFn<T>) { }
    
    and<U>(other: Validator<U>): FluentValidator<T & U> {
        const name = `${this.name} & ${other.name}`
        const v = async (value: any): Promise<ValidateResult<T & U>> => {
            const ra = await this.validate(value)
            if (ra.valid) {
                const rb = await other.validate(ra.value)
                if (rb.valid) {
                    return valid(rb.value as T&U)
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

    or<U>(other: Validator<U>): FluentValidator<T | U> {
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

    get typeValue(): T {
        throw 'Do not call typeValue at runtime'
    }
}
