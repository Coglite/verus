import { Kind, invalid, valid } from './common'
import { FluentValidator } from './fluent-validator'
import * as kindOf from 'kind-of'

export const Type = <T>(name: string, typeName: Kind) => new FluentValidator<T>(name, async (value: any) => {
    const type = kindOf(value)
    if (type !== typeName) {
        return invalid({
            type: 'type',
            name,
            expected: typeName,
            actual: type,
        })
    }
    return valid(value)
});

export const Number = Type<number>('Number', 'number')
export const Boolean = Type<boolean>('Boolean', 'boolean')
export const Symbol = Type<symbol>('Symbol', 'symbol')
export const Undefined = Type<undefined>('Undefined', 'undefined')
export const Obj = Type<object>('Object', 'object')
export const Func = Type<Function>('Function', 'function')

export interface StringOptions {
    minLength?: number
    maxLength?: number
}

export class StringValidator extends FluentValidator<string> {
    constructor(private options: StringOptions = {}) {
        super(`String`, async value => {
            const type = kindOf(value)
            if (type !== 'string') {
                return invalid({
                    type: 'type',
                    name: 'String',
                    expected: 'string',
                    actual: type,
                })
            }
            const s: string = value
            if (this.options.minLength && s.length < this.options.minLength) {
                return invalid({
                    type: 'length',
                    name: 'String',
                    length: s.length,
                    minLength: options.minLength
                })
            } else if (this.options.maxLength && s.length > this.options.maxLength) {
                return invalid({
                    type: 'length',
                    name: 'String',
                    length: s.length,
                    maxLength: options.maxLength
                })
            }
            return valid(value)
        })
    }

    minLength(minLength: number) {
        return new StringValidator({...this.options, minLength})
    }

    maxLength(maxLength: number) {
        return new StringValidator({...this.options, maxLength})
    }
}

export const String = new StringValidator()