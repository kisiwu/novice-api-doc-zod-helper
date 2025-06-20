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
})