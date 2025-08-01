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

describe('Unit tests', () => {

    it('should be an array', () => {

        const complicatedArraySchema = arrayUnique(arraySingle(
            z.array(
                z.enum([
                    'solution',
                    'team',
                    'createdBy',
                    'lastUpdatedBy'
                ])
            ).max(5)))
            .optional()

        const h = new OpenAPIZodHelper({ value: complicatedArraySchema })

        const t = h.getType()

        expect(t).to.be.a('string').that.equals('array')
        expect(h.hasMin()).to.be.a('boolean').that.equals(false)
        expect(h.hasMax()).to.be.a('boolean').that.equals(true)
        expect(h.getMax()).to.be.a('number').that.equals(5)

        const hUnique = new OpenAPIZodHelper({
            value: arrayUnique(z.array(
                z.url()
            ).min(2)).optional()
        })

        expect(hUnique.getType()).to.be.a('string').that.equals('array')
        expect(hUnique.hasMin()).to.be.a('boolean').that.equals(true)
        expect(hUnique.hasMax()).to.be.a('boolean').that.equals(false)
        expect(hUnique.getMin()).to.be.a('number').that.equals(2)

        const hSingle = new OpenAPIZodHelper({
            value: arraySingle(z.array(
                z.url()
            )).optional()
        })

        expect(hSingle.getType()).to.be.a('string').that.equals('array')
        expect(hSingle.hasMin()).to.be.a('boolean').that.equals(false)
        expect(hSingle.hasMax()).to.be.a('boolean').that.equals(false)
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

    it('should have params', () => {

        const routeSchema = {
            params: z.object({
                id: z.string().min(1)
            })
        }

        const hRoot = new OpenAPIZodHelper({ value: routeSchema, isRoot: true })

        const hParams = new OpenAPIZodHelper({ value: routeSchema.params })

        expect(hRoot.isValid()).to.be.a('boolean').that.equals(false)
        expect(hParams.isValid()).to.be.a('boolean').that.equals(true)

        expect(Object.keys(hParams.getChildren())).to.be.an('array').that.contains('id')
    })

    it('should have format type', () => {

        const hUrl = new OpenAPIZodHelper({ value: z.url() })
        const hEmail = new OpenAPIZodHelper({ value: z.email() })
        const hInt = new OpenAPIZodHelper({ value: z.int() })
        const hBigInt = new OpenAPIZodHelper({ value: z.bigint() })
        const hInt32 = new OpenAPIZodHelper({ value: z.int32() })
        const hInt64 = new OpenAPIZodHelper({ value: z.int64() })
        const hUint32 = new OpenAPIZodHelper({ value: z.uint32() })
        const hUint64 = new OpenAPIZodHelper({ value: z.uint64() })
        const hFloat32 = new OpenAPIZodHelper({ value: z.float32() })
        const hFloat64 = new OpenAPIZodHelper({ value: z.float64() })
        const hDate = new OpenAPIZodHelper({ value: z.date() })
        const hGuid = new OpenAPIZodHelper({ value: z.guid() })
        const hUuid = new OpenAPIZodHelper({ value: z.uuid() })
        const hUuidv4 = new OpenAPIZodHelper({ value: z.uuidv4() })
        const hUuidv6 = new OpenAPIZodHelper({ value: z.uuidv6() })
        const hUuidv7 = new OpenAPIZodHelper({ value: z.uuidv7() })
        const hBase64 = new OpenAPIZodHelper({ value: z.base64() })
        const hBase64Url = new OpenAPIZodHelper({ value: z.base64url() })
        const hFile = new OpenAPIZodHelper({ value: z.file() })

        expect(hUrl.getType()).to.be.a('string').that.equals('url')
        expect(hEmail.getType()).to.be.a('string').that.equals('email')
        expect(hInt.getType()).to.be.a('string').that.equals('integer')
        expect(hBigInt.getType()).to.be.a('string').that.equals('integer')
        expect(hInt32.getType()).to.be.a('string').that.equals('int32')
        expect(hInt64.getType()).to.be.a('string').that.equals('int64')
        expect(hUint32.getType()).to.be.a('string').that.equals('int32')
        expect(hUint64.getType()).to.be.a('string').that.equals('int64')
        expect(hFloat32.getType()).to.be.a('string').that.equals('float')
        expect(hFloat64.getType()).to.be.a('string').that.equals('float')
        expect(hDate.getType()).to.be.a('string').that.equals('date')
        expect(hGuid.getType()).to.be.a('string').that.equals('guid')
        expect(hUuid.getType()).to.be.a('string').that.equals('uuid')
        expect(hUuidv4.getType()).to.be.a('string').that.equals('uuid')
        expect(hUuidv6.getType()).to.be.a('string').that.equals('uuid')
        expect(hUuidv7.getType()).to.be.a('string').that.equals('uuid')
        expect(hBase64.getType()).to.be.a('string').that.equals('string')
        expect(hBase64Url.getType()).to.be.a('string').that.equals('string')
        expect(hFile.getType()).to.be.a('string').that.equals('binary')
    })

    it('should have min/max properties', () => {

        const h = new OpenAPIZodHelper({
            value: z.record(z.string(), z.string())
                .refine(x => Object.keys(x).length >= 1, { error: `Min ${1} property` })
                .refine(x => Object.keys(x).length <= 3, { error: `Max ${3} property` })
                .meta({
                    minProperties: 1
                })
                .meta({
                    maxProperties: 3
                })
        })

        expect(h.hasMin()).to.be.a('boolean').that.equals(true)
        expect(h.hasMax()).to.be.a('boolean').that.equals(true)
        expect(h.getMin()).to.be.a('number').that.equals(1)
        expect(h.getMax()).to.be.a('number').that.equals(3)

        /*
        z.looseObject({
                picture: z.url().nonempty().optional()
            })
                .refine(x => Object.keys(x).length >= 1, { error: `Min ${1} property` })
                .refine(x => Object.keys(x).length <= 3, { error: `Max ${3} properties` })
                .meta({
                    minProperties: 1
                })
                .meta({
                    maxProperties: 3
                }).parseAsync({ one: 1, two: 5, three: 8, four: 8 }).then(console.log, console.error)
                */

    })

    it('should have min max with preprocess', () => {
        const schema = z.preprocess(x => typeof x === 'string' ? parseInt(x) : x, z.int().min(1).max(55).default(50).optional())

        const h = new OpenAPIZodHelper({ value: schema })

        expect(h.getType()).to.be.a('string').that.equals('integer');
        expect(h.hasMin()).to.be.a('boolean').that.equals(true);
        expect(h.hasMax()).to.be.a('boolean').that.equals(true);
        expect(h.getMin()).to.be.a('number').that.equals(1);
        expect(h.getMax()).to.be.a('number').that.equals(55);
    })
})