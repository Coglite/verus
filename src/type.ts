import { Kind } from './common'
import { FluentValidator } from './fluent-validator'
import * as kindOf from 'kind-of'

export const Type = <T>(name: string, typeName: Kind) => new FluentValidator<T>(name, async (value: any) => {
    const type = kindOf(value)
    if (type !== typeName) {
        return {
            result: 'invalid',
            errors: {
                type: 'type',
                expected: typeName,
                actual: type
            }
        }
    }
    return {
        result: 'valid',
        value
    }
});

export const String = Type<string>('String', 'string')
export const Number = Type<number>('Number', 'number')
export const Boolean = Type<boolean>('Boolean', 'boolean')
export const Symbol = Type<symbol>('Symbol', 'symbol')
export const Undefined = Type<undefined>('Undefined', 'undefined')
export const Obj = Type<object>('Object', 'object')
export const Func = Type<Function>('Function', 'function')
