import { OpenAPIHelperInterface } from '@novice1/api-doc-generator';
import {
    AdditionalProperties,
    DiscriminatorObject,
    XMLObject,
    ExampleObject,
    ReferenceObject,
    EncodingObject
} from '@novice1/api-doc-generator/lib/generators/openapi/definitions';
import { BaseZodHelper } from './BaseZodHelper';

export class OpenAPIZodHelper extends BaseZodHelper implements OpenAPIHelperInterface {


    getFirstItem(): OpenAPIZodHelper | undefined {

        const schema = this.getMostInnerType()

        if (!schema?.def) return

        if ('element' in schema.def && typeof schema.def.element === 'object' && schema.def.element) {
            return new OpenAPIZodHelper({ value: schema.def.element })
        }

        return
    }
    getChildren(): Record<string, OpenAPIZodHelper> {
        const r: Record<string, OpenAPIZodHelper> = {};
        const schema = this.getMostInnerType()
        if (schema?.def) {
            if ('shape' in schema.def && typeof schema.def.shape === 'object' && schema.def.shape) {
                const properties: Record<string, unknown> = schema.def.shape as Record<string, unknown>
                for (const p in properties) {
                    r[p] = new OpenAPIZodHelper({ value: properties[p] })
                }
            }
        }
        return r;
    }
    getAlternatives(): OpenAPIZodHelper[] {
        const r: OpenAPIZodHelper[] = []
        const schema = this.getInnerType('union')
        if (schema?.def) {
            if ('options' in schema.def && Array.isArray(schema.def.options) && schema.def.options.length) {
                schema.def.options.forEach(opt => {
                    if (opt?.def?.type != 'literal') {
                        r.push(new OpenAPIZodHelper({ value: opt }))
                    }
                })
            }
        }
        return r
    }
    hasStyle(): boolean {
        return typeof this.getMeta('style') === 'string'
    }
    getStyle(): string {
        const style = this.getMeta('style')
        if (typeof style === 'string') {
            return style
        }
        return ''
    }
    hasAdditionalProperties(): boolean {
        const additionalProperties = this.getMeta('additionalProperties')
        return !!(additionalProperties)
    }
    getAdditionalProperties(): AdditionalProperties {
        const additionalProperties = this.getMeta('additionalProperties')
        return additionalProperties as AdditionalProperties
    }
    hasRef(): boolean {
        return typeof this.getMeta('ref') === 'string'
    }
    getRef(): string | undefined {
        const value = this.getMeta('ref')
        if (typeof value === 'string') {
            return value
        }
        return undefined
    }
    hasDiscriminator(): boolean {
        const value = this.getMeta('discriminator')
        return !!(value &&
            typeof value === 'object' &&
            'propertyName' in value &&
            value.propertyName &&
            typeof value.propertyName === 'string')
    }
    getDiscriminator(): DiscriminatorObject | undefined {
        const value = this.getMeta('discriminator')
        return value &&
            typeof value === 'object' &&
            'propertyName' in value &&
            value.propertyName &&
            typeof value.propertyName === 'string' ?
            (value as DiscriminatorObject) :
            undefined
    }
    hasXml(): boolean {
        const xmlMeta = this.getMeta('xml')
        return !!(xmlMeta && typeof xmlMeta === 'object')
    }
    getXml(): XMLObject | undefined {
        return this.getMeta('xml') as XMLObject | undefined
    }
    hasExamples(): boolean {
        const examples = this.getMeta('examples')
        return !!(Array.isArray(examples) && examples.length)
    }
    getExamples(): Record<string, ExampleObject | ReferenceObject> | undefined {
        const examples = this.getMeta('examples')
        if (Array.isArray(examples) && examples.length) {
            const r: Record<string, ExampleObject | ReferenceObject> = {};
            let i = 1
            for (const value of examples) {
                r[`${i}`] = {
                    value
                }
                i++
            }
            return r
        }
        return
    }
    hasEncoding(): boolean {
        const encodingMeta = this.getMeta('encoding')
        return !!(encodingMeta && typeof encodingMeta === 'object')
    }
    getEncoding(): Record<string, EncodingObject> | undefined {
        return this.getMeta('encoding') as Record<string, EncodingObject> | undefined
    }

}