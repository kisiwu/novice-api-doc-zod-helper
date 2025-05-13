import { PostmanHelperInterface } from '@novice1/api-doc-generator';
import { XMLObject } from '@novice1/api-doc-generator/lib/generators/openapi/definitions';
import { BaseZodHelper } from './BaseZodHelper';

export class PostmanZodHelper extends BaseZodHelper implements PostmanHelperInterface {

    getFirstItem(): PostmanZodHelper | undefined {

        const schema = this.getMostInnerType()

        if (!schema?.def) return

        if ('element' in schema.def && typeof schema.def.element === 'object' && schema.def.element) {
            return new PostmanZodHelper({ value: schema.def.element })
        }

        return
    }
    getChildren(): Record<string, PostmanZodHelper> {
        const r: Record<string, PostmanZodHelper> = {};
        const schema = this.getMostInnerType()
        if (schema?.def) {
            if ('shape' in schema.def && typeof schema.def.shape === 'object' && schema.def.shape) {
                const properties: Record<string, unknown> = schema.def.shape as Record<string, unknown>
                for (const p in properties) {
                    r[p] = new PostmanZodHelper({ value: properties[p] })
                }
            }
        }
        return r;
    }
    getAlternatives(): PostmanZodHelper[] {
        const r: PostmanZodHelper[] = []
        const schema = this.getInnerType('union')
        if (schema?.def) {
            if ('options' in schema.def && Array.isArray(schema.def.options) && schema.def.options.length) {
                schema.def.options.forEach(opt => {
                    if (opt?.def?.type != 'literal') {
                        r.push(new PostmanZodHelper({ value: opt }))
                    }
                })
            }
        }
        return r
    }

    hasContentType(): boolean {
        return typeof this.getMeta('contentType') === 'string'
    }

    getContentType(): string | undefined {
        const contentType = this.getMeta('contentType')
        if (typeof contentType === 'string') {
            return contentType
        }
        return
    }

    hasDescriptionType(): boolean {
        return typeof this.getMeta('descriptionType') === 'string'
    }

    getDescriptionType(): string | undefined {
        const descriptionType = this.getMeta('descriptionType')
        if (typeof descriptionType === 'string') {
            return descriptionType
        }
        return
    }

    hasXml(): boolean {
        const xmlMeta = this.getMeta('xml')
        return !!(xmlMeta && typeof xmlMeta === 'object')
    }
    getXml(): XMLObject | undefined {
        return this.getMeta('xml') as XMLObject | undefined
    }
}