import type { ZodTypeAny, z } from 'zod'

export { validate } from '@devhub/shared'
export type Infer<T extends ZodTypeAny> = z.infer<T>
