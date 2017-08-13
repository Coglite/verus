import { String, FluentValidator, Number, ISODate, ArrayOf, typeValue, errorMessage } from './index'
import { Shape } from './shape'
import { Invalid } from "./common";

const user = Shape('User', {
    name: String
})

const noExtraUser = Shape('NoExtraUser', {
    name: String
}, false)

const IsMock = () =>
    new FluentValidator<any>('Mock', jest.fn(value => ({ result: 'valid', value }))) as FluentValidator<any> & {validate: typeof jest}

describe('Shape', () => {
    it('should validate simple shape', async () => {
        const result = await user.validate({ name: 'Jane Smith', dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should detect invalid simple shape', async () => {
        const result = await user.validate({ name: 234, dogs: ['Fluffy'] })
        expect(result).toMatchSnapshot()
    })

    it('should optionally not allow extra fields in value', async () => {
        let result = await noExtraUser.validate({
            name: 'Jane Smith',
            dogs: ['Fluffy']
        })
        expect(result).toMatchSnapshot()

        result = await noExtraUser.validate({
            name: 'Jane Smith'
        })

        expect(result).toMatchSnapshot()

        result = await noExtraUser.validate({
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
        const {result} = await stringAndMock.validate(231)
        expect(result).toBe('invalid')
        expect(m.validate).toHaveBeenCalledTimes(0)
    })

    it('should evaluate both conditions if left side is valid', async () => {
        const m = IsMock()
        const stringAndMock = String.and(m)
        const {result} = await stringAndMock.validate('foobar')
        expect(result).toBe('valid')
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

const Product = Shape('Product', {
    name: String,
    price: Number,
})

const Subscription = Shape('Subscription', {
    name: String,
    startDate: ISODate,
    endDate: ISODate,
    monthlyPrice: Number,
})

const Gift = Shape('Gift', {
    name: String,
    recipient: String,
    price: Number
})

const Cart = Shape('Cart', {
    created: ISODate,
    items: ArrayOf(Product.or(Subscription).or(Gift))
})

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
        expect(r.result).toBe('invalid')
        expect((r as Invalid<any>).message).toMatchSnapshot()
    })
})
