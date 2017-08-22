import { String, FluentValidator, Number, ISODate, ArrayOf, typeValue, errorMessage } from './index'
import { Shape } from './shape'
import { Invalid } from './common'
import { Union } from './union'
import { Async } from './async'
import { Dict } from './dict'
import { Constant } from './constant'

class User extends Shape({
    name: String
}) {}

class NoExtraUser extends Shape({
    name: String
}, false) {}

const IsMock = () =>
    new FluentValidator<any>('Mock', jest.fn(value => ({ valid: true, value }))) as FluentValidator<any> & {validate: typeof jest}

describe('Shape', () => {
    it('should validate simple shape', async () => {
        const result = await User.validate({ name: 'Jane Smith', dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should detect invalid simple shape', async () => {
        const result = await User.validate({ name: 234, dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should optionally not allow extra fields in value', async () => {
        let result = await NoExtraUser.validate({
            name: 'Jane Smith',
            dogs: ['Fluffy']
        })
        expect(result).toMatchSnapshot()

        result = await NoExtraUser.validate({
            name: 'Jane Smith'
        })

        expect(result).toMatchSnapshot()

        result = await NoExtraUser.validate({
            name: 123,
            dogs: ['Snuffles']
        })

        expect(result).toMatchSnapshot()
    })
})

describe('FluentValidator', () => {
    it('should not evaluate the right side if left side fails', async () => {
        const m = IsMock()
        const stringAndMock = String.and(m)
        const {valid} = await stringAndMock.validate(231)
        expect(valid).toBe(false)
        expect(m.validate).toHaveBeenCalledTimes(0)
    })

    it('should evaluate both conditions if left side is valid', async () => {
        const m = IsMock()
        const stringAndMock = String.and(m)
        const {valid} = await stringAndMock.validate('foobar')
        expect(valid).toBe(true)
        expect(m.validate).toHaveBeenCalledTimes(1)
    })
})

describe('ISODate', () => {
    it('should not allow invalid dates', async () => {
        const r = await ISODate.validate('qwerqwerqwer')
        expect(r).toMatchSnapshot()
    })

    it('should parse ISO 8601 dates', async () => {
        const r = await ISODate.validate('2007-04-05T14:30-02:00')
        expect(r).toMatchSnapshot()
    })

    it('should not allow non-string values', async () => {
        const r = await ISODate.validate(324)
        expect(r).toMatchSnapshot()
    })
})

describe('ArrayOf', () => {
    it('should validate an array of strings', async () => {
        const r = await ArrayOf(String).validate(['foo', 'bar', 'baz'])
        expect(r).toMatchSnapshot()
    })

    it('should transform values to a new array', async () => {
        const r = await ArrayOf(ISODate).validate([
            '2007-04-05T14:30-02:00',
            '2008-04-05T14:30-02:00',
            '2009-04-05T14:30-02:00',
            '2010-11-05T14:30-02:00',
        ])
        expect(r).toMatchSnapshot()
    })

    it('should fail if some values are invalid', async () => {
        const r = await ArrayOf(ISODate).validate([
            '2009-04-05T14:30-02:00',
            '2015-06lasdkjflöakjsdfölkja',
            '2010-11-05T14:30-02:00',
            '2015-06lasdka',
        ])
        expect(r).toMatchSnapshot()
    })

    it('should fail on non-array value', async () => {
        const r = await ArrayOf(ISODate).validate(42)
        expect(r).toMatchSnapshot()
    })
})

describe('String', () => {
    it('should not validate if value is not string', async () => {
        const r = await String.validate(2313)
        expect(r).toMatchSnapshot()
    })
    it('should validate if length > minLength', async () => {
        const r = await String.minLength(4).validate('qwerty')
        expect(r).toMatchSnapshot()
    })

    it('should validate if length < maxLength', async () => {
        const r = await String.maxLength(4).validate('qwe')
        expect(r).toMatchSnapshot()
    })

    it('should fail if length < minLength', async () => {
        const r = await String.minLength(4).validate('qwe')
        expect(r).toMatchSnapshot()
    })

    it('should fail if length > maxLength', async () => {
        const r = await String.maxLength(3).validate('qwer')
        expect(r).toMatchSnapshot()
    })
})

describe('Union', () => {
    it('should match valid value', async () => {
        const r = await Union('a', 'b').validate('b')
        expect(r).toMatchSnapshot()
    })

    it('should not match invalid value', async () => {
        const r = await Union('a', 'b', 'c').validate('d')
        expect(r).toMatchSnapshot()
    })
})

describe('Async', () => {
    it('should succeed on valid value', async () => {
        const asyncBool = Async(async value => true)
        const r = await asyncBool.validate('')
        expect(r).toMatchSnapshot()
    })

    it('should fail on invalid value', async () => {
        const asyncBool = Async(async value => { throw 'is invalid!' })
        const r = await asyncBool.validate('')
        expect(r).toMatchSnapshot()
    })
})

describe('Dict', () => {
    it('should succeed on valid value', async () => {
        const stringDict = Dict(Number)
        const r = await stringDict.validate({
            hello: 324,
            world: 123
        })
        expect(r).toMatchSnapshot()
    })

    it('should fail on invalid values', async () => {
        const stringDict = Dict(Number)
        const r = await stringDict.validate({
            hello: 324,
            world: 'qwer',
            foo: 435,
            bar: new Date()
        })
        expect(r).toMatchSnapshot()
    })
})

describe('Constant', () => {
    it('should succeed on valid value', async () => {
        const constant = Constant<'asdf'>('asdf')
        const r = await constant.validate('asdf')
        expect(r).toMatchSnapshot()
    })

    it('should fail on invalid values', async () => {
        const constant = Constant<'asdf'>('asdf')
        const r = await constant.validate('qwer')
        expect(r).toMatchSnapshot()
    })
})

class Product extends Shape({
    name: String,
    price: Number,
}) {}

class Subscription extends Shape({
    name: String,
    startDate: ISODate,
    endDate: ISODate,
    monthlyPrice: Number,
}) {}

class Gift extends Shape({
    name: String,
    recipient: String,
    price: Number,
}) {}

class Cart extends Shape({
    created: ISODate,
    items: ArrayOf(Product.or(Subscription).or(Gift))
}) {}

describe('Error messages', () => {
    it('should produce 3 lines of error messages', async () => {
        const r = await Cart.validate({
            created: '2009-04-05garbage',
            items: [
                { name: 'Candybar', price: '0.9' },
                { name: 'Bread', price: 3.4 },
                { name: 'DSL', date: '2009-04-05T14:30-02:00', endDate: '2010-02-05T14:30-02:00', monthlyPrice: 33.4 },
            ]
        })
        expect(r.valid).toBe(false)
        expect((r as Invalid<any>).message).toMatchSnapshot()
    })
})
