import { FluentValidator } from './fluent-validator'
import { expect, invalid, valid } from './common'
import * as parseDate from 'date-fns/parse'
import * as isValidDate from 'date-fns/is_valid'

export const ISODate = new FluentValidator<Date>('ISODate', async value => {
    const kindResult = expect('string', value)
    if (!kindResult.valid) {
        return kindResult
    }

    const date = parseDate(value)
    if (!isValidDate(date)) {
        return invalid({
            type: 'parse',
            name: 'ISODate',
            expectedFormat: 'ISO 8601 date',
        })
    }
    return valid(date)
})
