import { String, Shape, FluentValidator, Number, ISODate } from './verus'

const user = Shape({
    name: String
})

const noExtraUser = Shape({
    name: String
}, false)

const IsMock = () =>
    new FluentValidator<any>('Mock', jest.fn(value => ({ result: 'valid', value }))) as FluentValidator<any> & {validate: typeof jest}

describe('Shape', () => {
    it('should validate simple shape', () => {
        const result = user.validate({ name: 'Jane Smith', dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should detect invalid simple shape', () => {
        const result = user.validate({ name: 234, dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should optionally not allow extra fields in value', () => {
        let result = noExtraUser.validate({
            name: 'Jane Smith',
            dogs: ['Fluffy']
        })
        expect(result).toMatchSnapshot()

        result = noExtraUser.validate({
            name: 'Jane Smith'
        })

        expect(result).toMatchSnapshot()

        result = noExtraUser.validate({
            name: 123,
            dogs: ['Snuffles']
        })

        expect(result).toMatchSnapshot()
    })
})

describe('FluentValidator', () => {
    it('should not evaluate the right side if left side fails', () => {
        const m = IsMock()
        const stringAndMock = String.and(m)
        expect(stringAndMock.validate(231).result).toBe('invalid')
        expect(m.validate).toHaveBeenCalledTimes(0)
    })

    it('should evaluate both conditions if left side is valid', () => {
        const m = IsMock()
        const stringAndMock = String.and(m)
        expect(stringAndMock.validate('foobar').result).toBe('valid')
        expect(m.validate).toHaveBeenCalledTimes(1)
    })
})

describe('ISODate', () => {
    it('should not allow invalid dates', () => {
        const r = ISODate.validate('qwerqwerqwer')
        expect(r).toMatchSnapshot()
    })

    it('should parse ISO 8601 dates', () => {
        const r = ISODate.validate('2007-04-05T14:30-02:00')
        expect(r).toMatchSnapshot()
    })

    it('should not allow non-string values', () => {
        const r = ISODate.validate(324)
        expect(r).toMatchSnapshot()
    })
})

