import { invalid, valid } from './common'
import { FluentValidator } from './fluent-validator'

export const Async = <T>(handler: (value: any) => Promise<T>) => new FluentValidator<T>('Async', async value => {
    try {
        const result = await handler(value)
        return valid(result)
    } catch (error) {
        const message = '' + error
        return invalid({
            type: 'async',
            name: 'Async',
            message
        })
    }
})