import { describe, it } from 'node:test';
import { z } from 'zod/v4'
import { OpenAPIZodHelper } from '../src'
import { expect } from 'chai';

export function arraySingle<T extends z.core.SomeType = z.core.$ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>(schema: z.ZodArray<T>) {
    return z.preprocess(x => Array.isArray(x) ? x : [x], schema)
}

export function arrayUnique<T extends z.core.SomeType = z.core.$ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>(schema: z.ZodArray<T> | z.ZodPipe<z.ZodTransform<unknown[], unknown>, z.ZodArray<T>>) {
    return schema.transform(x => x.filter((value, index, array) => array.indexOf(value) === index))
}

describe(() => {

    

    it('should be an array', () => {

        const h = new OpenAPIZodHelper({ value: arrayUnique(arraySingle(
            z.array(
                z.enum([
                    'solution',
                    'team',
                    'createdBy',
                    'lastUpdatedBy'
                ])
            )))
            .optional() })

        const t = h.getType()

        console.log('t=', t)

        expect(t).to.be.a('string').that.equals('array')
    })

    it('should not have min', () => {

        const h = new OpenAPIZodHelper({ value: z.number().max(5) })

        const t = h.getType()
        const hasMin = h.hasMin()
        const getMin = h.getMin()
        const hasMax = h.hasMax()
        const getMax = h.getMax()

        console.log('hasMin=', hasMin)
        console.log('getMin=', getMin)
        console.log('hasMax=', hasMax)
        console.log('getMax=', getMax)

        expect(t).to.be.a('string').that.equals('number')
        expect(hasMin).to.be.a('boolean').that.equals(false)
        expect(hasMax).to.be.a('boolean').that.equals(true)
        expect(getMax).to.be.a('number').that.equals(5)
    })
})