import { FluentValidator } from './fluent-validator'
import { expect } from './common'
import * as parseDate from 'date-fns/parse'
import * as isValidDate from 'date-fns/is_valid'

export const ISODate = new FluentValidator<Date>('ISODate', async value => {
    const kindResult = expect('string', value)
    if (kindResult.result === 'invalid') {
        return kindResult
    }

    const date = parseDate(value)
    if (!isValidDate(date)) {
        return {
            result: 'invalid',
            errors: {
                type: 'parse',
                expectedFormat: 'ISO 8601 date',
                value: value as string
            }
        }
    }
    return {
        result: 'valid',
        value: date
    }
})
