import { BaseHelperInterface } from '@novice1/api-doc-generator/lib/helpers/baseHelper';
import { ZodType } from 'zod/v4';

export abstract class BaseZodHelper implements BaseHelperInterface {
    protected _schema: Partial<ZodType>;
    protected outerTypes = ['optional', 'default']

    constructor({ value: schema = {} }: { value?: ZodType | unknown, isRoot?: boolean }) {
        this._schema = {}
        if (schema instanceof ZodType) {
            this._schema = schema
        }
    }

    protected getMostInnerType(): Partial<ZodType> | undefined {
        if (!this.isValid()) {
            return
        }

        let result = this._schema;

        while (result.def && 'innerType' in result.def) {
            result = result.def.innerType as Partial<ZodType>
        }

        if (result.def?.type === 'pipe' && 'out' in result && result.out instanceof ZodType) {
            //result = result.out
            if (result.out.def?.type == 'transform' &&
                'in' in result &&
                result.in instanceof ZodType
            ) {
                if ('out' in result.in &&
                result.in.out instanceof ZodType)
                    result = result.in.out
                else 
                    result = result.in
            } else {
                result = result.out
            }
        }

        return result
    }

    protected getInnerType(v: string): Partial<ZodType> | undefined {
        if (!this.isValid()) {
            return
        }

        let schema = this._schema;

        if (schema.def?.type === v) return schema

        let result: Partial<ZodType> | undefined

        while (!result && schema.def && ('innerType' in schema.def) || (schema.def?.type === 'pipe' && 'out' in schema)) {
            if ('innerType' in schema.def) {
                schema = schema.def.innerType as Partial<ZodType>
                if (schema.def?.type === v) {
                    result = schema
                    break;
                }
            } else if (schema.def?.type === 'pipe' && 'out' in schema && schema.out instanceof ZodType) {
                schema = schema.out
                if (schema.def?.type === v) {
                    result = schema
                    break;
                }
            } else {
                break;
            }
        }

        return result
    }

    protected getOptionalType(): Partial<ZodType> | undefined {
        return this.getInnerType('optional')
    }

    protected getDefaultType(): Partial<ZodType> | undefined {
        return this.getInnerType('default')
    }

    protected hasMeta(v: string): boolean {
        if (!this.isValid()) {
            return false;
        }

        if ('meta' in this._schema &&
            this._schema.meta &&
            typeof this._schema.meta === 'function') {
            const obj = this._schema.meta()
            if (obj && v in obj) {
                return true
            }
        }

        return false
    }

    protected getMeta(v: string): unknown {
        if (!this.hasMeta(v)) {
            return;
        }

        if ('meta' in this._schema &&
            this._schema.meta &&
            typeof this._schema.meta === 'function') {
            const obj = this._schema.meta()
            if (obj && v in obj) {
                return obj[v]
            }
        }

        return
    }

    isValid(): boolean {
        return this._schema instanceof ZodType
    }
    getType(): string {
        const schema = this.getMostInnerType()
        let r = schema?.def?.type || ''
        if (r == 'enum') {
            const enumValues = this.getEnum()
            if (enumValues.length) {
                r = typeof enumValues[0]
            }
        }

        if (r == 'bigint') {
            r = 'integer'
            if (schema?.def && 'format' in schema.def && typeof schema.def.format === 'string') {
                if (schema.def.format == 'int64' ||
                    schema.def.format == 'uint64')
                    r = 'int64'
            }

        } else if (r == 'string' && schema?.def && 'format' in schema.def && typeof schema.def.format === 'string') {
            if (['email', 'url', 'uri', 'uuid', 'guid'].includes(schema.def.format))
                r = schema.def.format
        } else if (r == 'number' && schema?.def && 'format' in schema.def && typeof schema.def.format === 'string') {
            if (schema.def.format == 'safeint')
                r = 'integer'
            else if (schema.def.format == 'int32' ||
                schema.def.format == 'uint32')
                r = 'int32'
            else if (schema.def.format == 'int64' ||
                schema.def.format == 'uint64')
                r = 'int64'
            else if (schema.def.format == 'float32' || schema.def.format == 'float64')
                r = 'float'
        } else if (r == 'record') {
            r = 'object'
        } else if (r == 'file') {
            r = 'binary'
        }
        return r
    }
    getDescription(): string {
        let r = ''

        if ('description' in this._schema && typeof this._schema.description === 'string') {
            r = this._schema.description
        } else {
            const schema = this.getMostInnerType()
            r = schema?.description || r
        }

        return r;
    }
    isRequired(): boolean {
        return !this.getOptionalType()?.isOptional?.()
    }
    isUnique(): boolean {
        return this.getMeta('uniqueItems') === true
    }
    hasDefaultValue(): boolean {
        const dt = this.getDefaultType()
        return !!(dt?.def && 'defaultValue' in dt.def && typeof dt.def.defaultValue != 'undefined')
    }
    getDefaultValue(): unknown {
        const dt = this.getDefaultType()
        if (dt?.def && 'defaultValue' in dt.def) {
            if (typeof dt.def.defaultValue === 'function')
                return dt.def.defaultValue()
            else {
                return dt.def.defaultValue
            }
        }
        return
    }
    hasExampleValue(): boolean {
        const examples = this.getMeta('examples')
        return !!(Array.isArray(examples) && examples.length)
    }
    getExampleValue(): unknown {
        const examples = this.getMeta('examples')
        if (Array.isArray(examples) && examples.length) {
            return examples[0]
        }
        return
    }
    isDeprecated(): boolean {
        return !!(this.getMeta('deprecated'))
    }
    allowsEmptyValue(): boolean {
        const schema = this.getMostInnerType()

        if (schema?.def?.type === 'enum' && 'enum' in schema && typeof schema.enum === 'object' && schema.enum) {
            const enumValues = schema.enum as Record<PropertyKey, unknown>
            return Object.keys(enumValues).some(k => {
                return enumValues[k] === ''
            })
        }

        return (schema?.def?.type === 'string' && (!('minLength' in schema) || !schema.minLength))
    }
    getEnum(): unknown[] {
        let r: unknown[] = []
        let schema = this.getInnerType('enum')
        if (schema?.def) {
            if ('enum' in schema) {
                if (Array.isArray(schema.enum) && schema.enum.length) {
                    schema.enum.forEach(opt => {
                        r.push(opt)
                    })
                } else if (!Array.isArray(schema.enum) && schema.enum && typeof schema.enum === 'object') {
                    const enumValues = schema.enum as Record<PropertyKey, unknown>
                    for (const k in enumValues) {
                        r.push(enumValues[k])
                    }
                }
            }
        } else {
            schema = this.getInnerType('union')
            if (schema?.def) {
                if ('options' in schema.def && Array.isArray(schema.def.options) && schema.def.options.length) {
                    schema.def.options.forEach(opt => {
                        if (opt?.def?.type === 'literal' && Array.isArray(opt.def.values) && opt.def.values.length) {
                            r = r.concat(opt.def.values)
                        }
                    })
                }
            }
        }
        return r;
    }
    hasMin(): boolean {
        const schema = this.getMostInnerType()

        if (schema?.def?.type === 'object' || schema?.def?.type === 'record') {
            const v = this.getMeta('minProperties')
            if (typeof v === 'number') return true
        }

        if (schema?.def?.type === 'array') {
            return !!(schema._zod?.bag && 'minimum' in schema._zod.bag && typeof schema._zod.bag.minimum === 'number')
        }
        return !!(schema && (
            ('minLength' in schema && typeof schema.minLength === 'number' && isFinite(schema.minLength)) ||
            ('minValue' in schema && typeof schema.minValue === 'number' && isFinite(schema.minValue))
        ))
    }
    hasMax(): boolean {
        const schema = this.getMostInnerType()

        if (schema?.def?.type === 'object' || schema?.def?.type === 'record') {
            const v = this.getMeta('maxProperties')
            if (typeof v === 'number') return true
        }

        if (schema?.def?.type === 'array') {
            return !!(schema._zod?.bag && 'maximum' in schema._zod.bag && typeof schema._zod.bag.maximum === 'number')
        }
        return !!(schema && (
            ('maxLength' in schema && typeof schema.maxLength === 'number' && isFinite(schema.maxLength)) ||
            ('maxValue' in schema && typeof schema.maxValue === 'number' && isFinite(schema.maxValue))
        ))
    }
    getMin(): number | undefined {
        const schema = this.getMostInnerType()
        if (!schema) return

        if (schema.def?.type === 'object' || schema?.def?.type === 'record') {
            const v = this.getMeta('minProperties')
            if (typeof v === 'number') return v
        }

        if (schema.def?.type === 'array' && schema._zod && typeof schema._zod.bag.minimum === 'number') {
            return schema._zod.bag.minimum
        }

        if ('minLength' in schema && typeof schema.minLength === 'number') {
            return schema.minLength
        }
        if ('minValue' in schema && typeof schema.minValue === 'number') {
            return schema.minValue
        }
        return
    }
    getMax(): number | undefined {
        const schema = this.getMostInnerType()
        if (!schema) return

        if (schema.def?.type === 'object' || schema?.def?.type === 'record') {
            const v = this.getMeta('maxProperties')
            if (typeof v === 'number') return v
        }

        if (schema.def?.type === 'array' && schema._zod && typeof schema._zod.bag.maximum === 'number') {
            return schema._zod.bag.maximum
        }

        if ('maxLength' in schema && typeof schema.maxLength === 'number') {
            return schema.maxLength
        }
        if ('maxValue' in schema && typeof schema.maxValue === 'number') {
            return schema.maxValue
        }
        return
    }
    getUnit(): string {
        const unit: unknown = this.getMeta('unit')
        if (typeof unit === 'string') {
            return unit
        }
        return ''
    }

}