import { OpenAPI } from '@novice1/api-doc-generator';
import { before, describe, it } from 'node:test';
import routing from '@novice1/routing';
import * as z from 'zod'
import { OpenAPIZodHelper } from '../src'
import { expect } from 'chai';

const openapi = new OpenAPI({ helperClass: OpenAPIZodHelper, helperSchemaProperty: 'schema' })
let result = openapi.result()

function getFirstItem(path: string, method = 'get') {
    const parameters: Array<Record<string, unknown>> | undefined = (result.paths[path][method] as Record<string, unknown>)?.parameters as Array<Record<string, unknown>> | undefined
    const item: Record<string, unknown> | undefined = parameters?.[0]
    const itemSchema: Record<string, unknown> | undefined = item?.schema as Record<string, unknown> | undefined
    return {
        item,
        itemSchema
    }
}

describe(() => {

    before(() => {
        const router = routing()
            .get({
                name: 'Main app',
                path: '/app',
                auth: true,
                tags: ['default'],
                parameters: {
                    schema: {
                        query: {
                            version: z.preprocess((x) => Number(x), z.enum({
                                one: 1,
                                two: 2,
                                three: 3
                            }).meta({
                                description: 'version number'
                            })).optional()
                            .default(2)
                        }
                    }
                }
            }, function (req, res) {
                res.json(req.query.version)
            });

        openapi.add(router.getMeta())

        result = openapi.result()
    })

    it('should have the name', () => {


        console.log(JSON.stringify(openapi.result(), null, ' '))

        const { item } = getFirstItem('/app')

        expect(item?.name).to.be.a('string').that.equals('version')
    })

    it('should have the parameter\'s location ("query")', () => {
        const { item } = getFirstItem('/app')

        expect(item?.in).to.be.a('string').that.equals('query')
    })

    it('should have the description', () => {
        const { item } = getFirstItem('/app')

        expect(item?.description).to.be.a('string').that.equals('version number')
    })

    it('should have the type of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.type).to.be.a('string').that.equals('number')
    })

    it('should have the default value of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.default).to.be.a('number').that.equals(2)
    })

    it('should have the enum of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.enum).to.be.an('array').with.lengthOf(3)
    })
})