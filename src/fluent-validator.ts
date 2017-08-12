import { Validator, ValidateFn, ValidateResult } from './common'

export class FluentValidator<T> implements Validator<T> {
    constructor(
        public readonly name: string,
        public readonly validate: ValidateFn<T>) {}

    and<U>(other: Validator<U>): FluentValidator<T & U> {
        const v = async (value: any): Promise<ValidateResult<T & U>> => {
            const ra = await this.validate(value)
            if (ra.result === 'valid') {
                const rb = await other.validate(ra.value)
                if (rb.result === 'valid') {
                    return {
                        result: 'valid',
                        value: rb.value as T&U
                    }
                } else {
                    return {
                        result: 'invalid',
                        errors: {
                            type: 'and',
                            right: rb.errors
                        }
                    }
                }
            } else {
                return {
                    result: 'invalid',
                    errors: {
                        type: 'and',
                        left: ra.errors
                    }
                }
            }
        }

        return new FluentValidator<T & U>(`${this.name} & ${other.name}`, v)
    }

    or<U>(other: Validator<U>): FluentValidator<T | U> {
        const v = async (value: any): Promise<ValidateResult<T | U>> => {
            const ra = await this.validate(value)
            if (ra.result === 'valid') {
                return ra as ValidateResult<T | U>
            } else {
                const rb = await other.validate(value)
                if (rb.result === 'invalid') {
                    return {
                        result: 'invalid',
                        errors: {
                            type: 'or',
                            left: ra.errors,
                            right: rb.errors,
                        }
                    }
                }
                return rb
            }
        }

        return new FluentValidator<T | U>(`${this.name} | ${other.name}`, v)
    }
}
