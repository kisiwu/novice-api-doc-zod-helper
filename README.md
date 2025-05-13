# @novice1/api-doc-zod-helper
Zod4 helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-zod`.

## Installation

```bash
npm install @novice1/api-doc-zod-helper
```

## OpenAPI Specification

```ts
import { 
  OpenAPI 
} from '@novice1/api-doc-generator';
import { 
    OpenAPIZodHelper 
} from '@novice1/api-doc-zod-helper';
import routing from '@novice1/routing';
import { validatorZod } from '@novice1/validator-zod';
import * as z from 'zod';

const openapi = new OpenAPI({ 
    helperClass: OpenAPIZodHelper, // here
    helperSchemaProperty: 'schema'
});

// create a router
const router = routing()
    .setValidators(
        validatorZod({}, undefined, 'schema')
    )
    .get({
        name: 'Main app',
        path: '/app',
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
                    }))
                    .optional()
                    .default(2)
                }
            }
        }
    }, function (req, res) {
        res.json(req.validated?.<{ version: number }>().query?.version)
    });

// add router metadata
openapi.add(router.getMeta());

// get OpenAPI Object (json)
const doc = openapi.result();
```

## Postman Specification

```ts
import { 
  Postman 
} from '@novice1/api-doc-generator';
import { 
    PostmanZodHelper 
} from '@novice1/api-doc-zod-helper';
import routing from '@novice1/routing';
import { validatorZod } from '@novice1/validator-zod';
import * as z from 'zod';

const postman = new Postman({ 
    helperClass: PostmanZodHelper, // here
    helperSchemaProperty: 'schema'
});

// create a router
const router = routing()
    .setValidators(
        validatorZod({}, undefined, 'schema')
    )
    .get({
        name: 'Main app',
        path: '/app',
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
                    }))
                    .optional()
                    .default(2)
                }
            }
        }
    }, function (req, res) {
        res.json(req.validated?.<{ version: number }>().query?.version)
    });

// add router metadata
postman.add(router.getMeta());

// get Postman Object (json)
const doc = postman.result();
```

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [@novice1/validator-zod](https://kisiwu.github.io/novice-validator-zod/latest/)