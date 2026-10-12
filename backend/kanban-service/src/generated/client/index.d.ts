
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model UserRef
 * 
 */
export type UserRef = $Result.DefaultSelection<Prisma.$UserRefPayload>
/**
 * Model Board
 * 
 */
export type Board = $Result.DefaultSelection<Prisma.$BoardPayload>
/**
 * Model Column
 * 
 */
export type Column = $Result.DefaultSelection<Prisma.$ColumnPayload>
/**
 * Model Task
 * 
 */
export type Task = $Result.DefaultSelection<Prisma.$TaskPayload>
/**
 * Model Sprint
 * 
 */
export type Sprint = $Result.DefaultSelection<Prisma.$SprintPayload>
/**
 * Model Epic
 * 
 */
export type Epic = $Result.DefaultSelection<Prisma.$EpicPayload>
/**
 * Model Label
 * 
 */
export type Label = $Result.DefaultSelection<Prisma.$LabelPayload>
/**
 * Model TaskLabel
 * 
 */
export type TaskLabel = $Result.DefaultSelection<Prisma.$TaskLabelPayload>
/**
 * Model Comment
 * 
 */
export type Comment = $Result.DefaultSelection<Prisma.$CommentPayload>
/**
 * Model Attachment
 * An attachment: the bytes live in the file-service.
 */
export type Attachment = $Result.DefaultSelection<Prisma.$AttachmentPayload>
/**
 * Model TimeEntry
 * 
 */
export type TimeEntry = $Result.DefaultSelection<Prisma.$TimeEntryPayload>
/**
 * Model TaskWatcher
 * 
 */
export type TaskWatcher = $Result.DefaultSelection<Prisma.$TaskWatcherPayload>
/**
 * Model Activity
 * 
 */
export type Activity = $Result.DefaultSelection<Prisma.$ActivityPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const BoardVisibility: {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC'
};

export type BoardVisibility = (typeof BoardVisibility)[keyof typeof BoardVisibility]


export const TaskStatus: {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED'
};

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]


export const TaskType: {
  TASK: 'TASK',
  STORY: 'STORY',
  BUG: 'BUG',
  SUBTASK: 'SUBTASK'
};

export type TaskType = (typeof TaskType)[keyof typeof TaskType]


export const Priority: {
  LOWEST: 'LOWEST',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  HIGHEST: 'HIGHEST'
};

export type Priority = (typeof Priority)[keyof typeof Priority]


export const SprintStatus: {
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

export type SprintStatus = (typeof SprintStatus)[keyof typeof SprintStatus]

}

export type BoardVisibility = $Enums.BoardVisibility

export const BoardVisibility: typeof $Enums.BoardVisibility

export type TaskStatus = $Enums.TaskStatus

export const TaskStatus: typeof $Enums.TaskStatus

export type TaskType = $Enums.TaskType

export const TaskType: typeof $Enums.TaskType

export type Priority = $Enums.Priority

export const Priority: typeof $Enums.Priority

export type SprintStatus = $Enums.SprintStatus

export const SprintStatus: typeof $Enums.SprintStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserRefs
 * const userRefs = await prisma.userRef.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more UserRefs
   * const userRefs = await prisma.userRef.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.userRef`: Exposes CRUD operations for the **UserRef** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserRefs
    * const userRefs = await prisma.userRef.findMany()
    * ```
    */
  get userRef(): Prisma.UserRefDelegate<ExtArgs>;

  /**
   * `prisma.board`: Exposes CRUD operations for the **Board** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Boards
    * const boards = await prisma.board.findMany()
    * ```
    */
  get board(): Prisma.BoardDelegate<ExtArgs>;

  /**
   * `prisma.column`: Exposes CRUD operations for the **Column** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Columns
    * const columns = await prisma.column.findMany()
    * ```
    */
  get column(): Prisma.ColumnDelegate<ExtArgs>;

  /**
   * `prisma.task`: Exposes CRUD operations for the **Task** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tasks
    * const tasks = await prisma.task.findMany()
    * ```
    */
  get task(): Prisma.TaskDelegate<ExtArgs>;

  /**
   * `prisma.sprint`: Exposes CRUD operations for the **Sprint** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sprints
    * const sprints = await prisma.sprint.findMany()
    * ```
    */
  get sprint(): Prisma.SprintDelegate<ExtArgs>;

  /**
   * `prisma.epic`: Exposes CRUD operations for the **Epic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Epics
    * const epics = await prisma.epic.findMany()
    * ```
    */
  get epic(): Prisma.EpicDelegate<ExtArgs>;

  /**
   * `prisma.label`: Exposes CRUD operations for the **Label** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Labels
    * const labels = await prisma.label.findMany()
    * ```
    */
  get label(): Prisma.LabelDelegate<ExtArgs>;

  /**
   * `prisma.taskLabel`: Exposes CRUD operations for the **TaskLabel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TaskLabels
    * const taskLabels = await prisma.taskLabel.findMany()
    * ```
    */
  get taskLabel(): Prisma.TaskLabelDelegate<ExtArgs>;

  /**
   * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Comments
    * const comments = await prisma.comment.findMany()
    * ```
    */
  get comment(): Prisma.CommentDelegate<ExtArgs>;

  /**
   * `prisma.attachment`: Exposes CRUD operations for the **Attachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attachments
    * const attachments = await prisma.attachment.findMany()
    * ```
    */
  get attachment(): Prisma.AttachmentDelegate<ExtArgs>;

  /**
   * `prisma.timeEntry`: Exposes CRUD operations for the **TimeEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TimeEntries
    * const timeEntries = await prisma.timeEntry.findMany()
    * ```
    */
  get timeEntry(): Prisma.TimeEntryDelegate<ExtArgs>;

  /**
   * `prisma.taskWatcher`: Exposes CRUD operations for the **TaskWatcher** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TaskWatchers
    * const taskWatchers = await prisma.taskWatcher.findMany()
    * ```
    */
  get taskWatcher(): Prisma.TaskWatcherDelegate<ExtArgs>;

  /**
   * `prisma.activity`: Exposes CRUD operations for the **Activity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Activities
    * const activities = await prisma.activity.findMany()
    * ```
    */
  get activity(): Prisma.ActivityDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    UserRef: 'UserRef',
    Board: 'Board',
    Column: 'Column',
    Task: 'Task',
    Sprint: 'Sprint',
    Epic: 'Epic',
    Label: 'Label',
    TaskLabel: 'TaskLabel',
    Comment: 'Comment',
    Attachment: 'Attachment',
    TimeEntry: 'TimeEntry',
    TaskWatcher: 'TaskWatcher',
    Activity: 'Activity'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "userRef" | "board" | "column" | "task" | "sprint" | "epic" | "label" | "taskLabel" | "comment" | "attachment" | "timeEntry" | "taskWatcher" | "activity"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      UserRef: {
        payload: Prisma.$UserRefPayload<ExtArgs>
        fields: Prisma.UserRefFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserRefFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserRefFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          findFirst: {
            args: Prisma.UserRefFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserRefFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          findMany: {
            args: Prisma.UserRefFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>[]
          }
          create: {
            args: Prisma.UserRefCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          createMany: {
            args: Prisma.UserRefCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserRefCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>[]
          }
          delete: {
            args: Prisma.UserRefDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          update: {
            args: Prisma.UserRefUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          deleteMany: {
            args: Prisma.UserRefDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserRefUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserRefUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRefPayload>
          }
          aggregate: {
            args: Prisma.UserRefAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserRef>
          }
          groupBy: {
            args: Prisma.UserRefGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserRefGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserRefCountArgs<ExtArgs>
            result: $Utils.Optional<UserRefCountAggregateOutputType> | number
          }
        }
      }
      Board: {
        payload: Prisma.$BoardPayload<ExtArgs>
        fields: Prisma.BoardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BoardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BoardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          findFirst: {
            args: Prisma.BoardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BoardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          findMany: {
            args: Prisma.BoardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>[]
          }
          create: {
            args: Prisma.BoardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          createMany: {
            args: Prisma.BoardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BoardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>[]
          }
          delete: {
            args: Prisma.BoardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          update: {
            args: Prisma.BoardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          deleteMany: {
            args: Prisma.BoardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BoardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BoardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BoardPayload>
          }
          aggregate: {
            args: Prisma.BoardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBoard>
          }
          groupBy: {
            args: Prisma.BoardGroupByArgs<ExtArgs>
            result: $Utils.Optional<BoardGroupByOutputType>[]
          }
          count: {
            args: Prisma.BoardCountArgs<ExtArgs>
            result: $Utils.Optional<BoardCountAggregateOutputType> | number
          }
        }
      }
      Column: {
        payload: Prisma.$ColumnPayload<ExtArgs>
        fields: Prisma.ColumnFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ColumnFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ColumnFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          findFirst: {
            args: Prisma.ColumnFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ColumnFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          findMany: {
            args: Prisma.ColumnFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>[]
          }
          create: {
            args: Prisma.ColumnCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          createMany: {
            args: Prisma.ColumnCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ColumnCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>[]
          }
          delete: {
            args: Prisma.ColumnDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          update: {
            args: Prisma.ColumnUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          deleteMany: {
            args: Prisma.ColumnDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ColumnUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ColumnUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColumnPayload>
          }
          aggregate: {
            args: Prisma.ColumnAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateColumn>
          }
          groupBy: {
            args: Prisma.ColumnGroupByArgs<ExtArgs>
            result: $Utils.Optional<ColumnGroupByOutputType>[]
          }
          count: {
            args: Prisma.ColumnCountArgs<ExtArgs>
            result: $Utils.Optional<ColumnCountAggregateOutputType> | number
          }
        }
      }
      Task: {
        payload: Prisma.$TaskPayload<ExtArgs>
        fields: Prisma.TaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findFirst: {
            args: Prisma.TaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          findMany: {
            args: Prisma.TaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          create: {
            args: Prisma.TaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          createMany: {
            args: Prisma.TaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>[]
          }
          delete: {
            args: Prisma.TaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          update: {
            args: Prisma.TaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          deleteMany: {
            args: Prisma.TaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskPayload>
          }
          aggregate: {
            args: Prisma.TaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTask>
          }
          groupBy: {
            args: Prisma.TaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaskCountArgs<ExtArgs>
            result: $Utils.Optional<TaskCountAggregateOutputType> | number
          }
        }
      }
      Sprint: {
        payload: Prisma.$SprintPayload<ExtArgs>
        fields: Prisma.SprintFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SprintFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SprintFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          findFirst: {
            args: Prisma.SprintFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SprintFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          findMany: {
            args: Prisma.SprintFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>[]
          }
          create: {
            args: Prisma.SprintCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          createMany: {
            args: Prisma.SprintCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SprintCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>[]
          }
          delete: {
            args: Prisma.SprintDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          update: {
            args: Prisma.SprintUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          deleteMany: {
            args: Prisma.SprintDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SprintUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SprintUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SprintPayload>
          }
          aggregate: {
            args: Prisma.SprintAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSprint>
          }
          groupBy: {
            args: Prisma.SprintGroupByArgs<ExtArgs>
            result: $Utils.Optional<SprintGroupByOutputType>[]
          }
          count: {
            args: Prisma.SprintCountArgs<ExtArgs>
            result: $Utils.Optional<SprintCountAggregateOutputType> | number
          }
        }
      }
      Epic: {
        payload: Prisma.$EpicPayload<ExtArgs>
        fields: Prisma.EpicFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EpicFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EpicFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          findFirst: {
            args: Prisma.EpicFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EpicFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          findMany: {
            args: Prisma.EpicFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>[]
          }
          create: {
            args: Prisma.EpicCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          createMany: {
            args: Prisma.EpicCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EpicCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>[]
          }
          delete: {
            args: Prisma.EpicDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          update: {
            args: Prisma.EpicUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          deleteMany: {
            args: Prisma.EpicDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EpicUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EpicUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          aggregate: {
            args: Prisma.EpicAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEpic>
          }
          groupBy: {
            args: Prisma.EpicGroupByArgs<ExtArgs>
            result: $Utils.Optional<EpicGroupByOutputType>[]
          }
          count: {
            args: Prisma.EpicCountArgs<ExtArgs>
            result: $Utils.Optional<EpicCountAggregateOutputType> | number
          }
        }
      }
      Label: {
        payload: Prisma.$LabelPayload<ExtArgs>
        fields: Prisma.LabelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LabelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LabelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          findFirst: {
            args: Prisma.LabelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LabelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          findMany: {
            args: Prisma.LabelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>[]
          }
          create: {
            args: Prisma.LabelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          createMany: {
            args: Prisma.LabelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LabelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>[]
          }
          delete: {
            args: Prisma.LabelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          update: {
            args: Prisma.LabelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          deleteMany: {
            args: Prisma.LabelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LabelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LabelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabelPayload>
          }
          aggregate: {
            args: Prisma.LabelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLabel>
          }
          groupBy: {
            args: Prisma.LabelGroupByArgs<ExtArgs>
            result: $Utils.Optional<LabelGroupByOutputType>[]
          }
          count: {
            args: Prisma.LabelCountArgs<ExtArgs>
            result: $Utils.Optional<LabelCountAggregateOutputType> | number
          }
        }
      }
      TaskLabel: {
        payload: Prisma.$TaskLabelPayload<ExtArgs>
        fields: Prisma.TaskLabelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaskLabelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaskLabelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          findFirst: {
            args: Prisma.TaskLabelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaskLabelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          findMany: {
            args: Prisma.TaskLabelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>[]
          }
          create: {
            args: Prisma.TaskLabelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          createMany: {
            args: Prisma.TaskLabelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaskLabelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>[]
          }
          delete: {
            args: Prisma.TaskLabelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          update: {
            args: Prisma.TaskLabelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          deleteMany: {
            args: Prisma.TaskLabelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaskLabelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TaskLabelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskLabelPayload>
          }
          aggregate: {
            args: Prisma.TaskLabelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTaskLabel>
          }
          groupBy: {
            args: Prisma.TaskLabelGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaskLabelGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaskLabelCountArgs<ExtArgs>
            result: $Utils.Optional<TaskLabelCountAggregateOutputType> | number
          }
        }
      }
      Comment: {
        payload: Prisma.$CommentPayload<ExtArgs>
        fields: Prisma.CommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findFirst: {
            args: Prisma.CommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findMany: {
            args: Prisma.CommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          create: {
            args: Prisma.CommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          createMany: {
            args: Prisma.CommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CommentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          delete: {
            args: Prisma.CommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          update: {
            args: Prisma.CommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          deleteMany: {
            args: Prisma.CommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          aggregate: {
            args: Prisma.CommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComment>
          }
          groupBy: {
            args: Prisma.CommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentCountArgs<ExtArgs>
            result: $Utils.Optional<CommentCountAggregateOutputType> | number
          }
        }
      }
      Attachment: {
        payload: Prisma.$AttachmentPayload<ExtArgs>
        fields: Prisma.AttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findFirst: {
            args: Prisma.AttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findMany: {
            args: Prisma.AttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          create: {
            args: Prisma.AttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          createMany: {
            args: Prisma.AttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          delete: {
            args: Prisma.AttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          update: {
            args: Prisma.AttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          deleteMany: {
            args: Prisma.AttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          aggregate: {
            args: Prisma.AttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttachment>
          }
          groupBy: {
            args: Prisma.AttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<AttachmentCountAggregateOutputType> | number
          }
        }
      }
      TimeEntry: {
        payload: Prisma.$TimeEntryPayload<ExtArgs>
        fields: Prisma.TimeEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TimeEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TimeEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          findFirst: {
            args: Prisma.TimeEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TimeEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          findMany: {
            args: Prisma.TimeEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>[]
          }
          create: {
            args: Prisma.TimeEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          createMany: {
            args: Prisma.TimeEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TimeEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>[]
          }
          delete: {
            args: Prisma.TimeEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          update: {
            args: Prisma.TimeEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          deleteMany: {
            args: Prisma.TimeEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TimeEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TimeEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TimeEntryPayload>
          }
          aggregate: {
            args: Prisma.TimeEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTimeEntry>
          }
          groupBy: {
            args: Prisma.TimeEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<TimeEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.TimeEntryCountArgs<ExtArgs>
            result: $Utils.Optional<TimeEntryCountAggregateOutputType> | number
          }
        }
      }
      TaskWatcher: {
        payload: Prisma.$TaskWatcherPayload<ExtArgs>
        fields: Prisma.TaskWatcherFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TaskWatcherFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TaskWatcherFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          findFirst: {
            args: Prisma.TaskWatcherFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TaskWatcherFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          findMany: {
            args: Prisma.TaskWatcherFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>[]
          }
          create: {
            args: Prisma.TaskWatcherCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          createMany: {
            args: Prisma.TaskWatcherCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TaskWatcherCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>[]
          }
          delete: {
            args: Prisma.TaskWatcherDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          update: {
            args: Prisma.TaskWatcherUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          deleteMany: {
            args: Prisma.TaskWatcherDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TaskWatcherUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TaskWatcherUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TaskWatcherPayload>
          }
          aggregate: {
            args: Prisma.TaskWatcherAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTaskWatcher>
          }
          groupBy: {
            args: Prisma.TaskWatcherGroupByArgs<ExtArgs>
            result: $Utils.Optional<TaskWatcherGroupByOutputType>[]
          }
          count: {
            args: Prisma.TaskWatcherCountArgs<ExtArgs>
            result: $Utils.Optional<TaskWatcherCountAggregateOutputType> | number
          }
        }
      }
      Activity: {
        payload: Prisma.$ActivityPayload<ExtArgs>
        fields: Prisma.ActivityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          findFirst: {
            args: Prisma.ActivityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          findMany: {
            args: Prisma.ActivityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>[]
          }
          create: {
            args: Prisma.ActivityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          createMany: {
            args: Prisma.ActivityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>[]
          }
          delete: {
            args: Prisma.ActivityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          update: {
            args: Prisma.ActivityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          deleteMany: {
            args: Prisma.ActivityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ActivityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          aggregate: {
            args: Prisma.ActivityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivity>
          }
          groupBy: {
            args: Prisma.ActivityGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type BoardCountOutputType
   */

  export type BoardCountOutputType = {
    columns: number
    tasks: number
    sprints: number
    epics: number
    labels: number
    activity: number
  }

  export type BoardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    columns?: boolean | BoardCountOutputTypeCountColumnsArgs
    tasks?: boolean | BoardCountOutputTypeCountTasksArgs
    sprints?: boolean | BoardCountOutputTypeCountSprintsArgs
    epics?: boolean | BoardCountOutputTypeCountEpicsArgs
    labels?: boolean | BoardCountOutputTypeCountLabelsArgs
    activity?: boolean | BoardCountOutputTypeCountActivityArgs
  }

  // Custom InputTypes
  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BoardCountOutputType
     */
    select?: BoardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountColumnsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColumnWhereInput
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountSprintsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SprintWhereInput
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountEpicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpicWhereInput
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountLabelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LabelWhereInput
  }

  /**
   * BoardCountOutputType without action
   */
  export type BoardCountOutputTypeCountActivityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityWhereInput
  }


  /**
   * Count Type ColumnCountOutputType
   */

  export type ColumnCountOutputType = {
    tasks: number
  }

  export type ColumnCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | ColumnCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes
  /**
   * ColumnCountOutputType without action
   */
  export type ColumnCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColumnCountOutputType
     */
    select?: ColumnCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ColumnCountOutputType without action
   */
  export type ColumnCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }


  /**
   * Count Type TaskCountOutputType
   */

  export type TaskCountOutputType = {
    subtasks: number
    labels: number
    comments: number
    attachments: number
    timeEntries: number
    watchers: number
  }

  export type TaskCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subtasks?: boolean | TaskCountOutputTypeCountSubtasksArgs
    labels?: boolean | TaskCountOutputTypeCountLabelsArgs
    comments?: boolean | TaskCountOutputTypeCountCommentsArgs
    attachments?: boolean | TaskCountOutputTypeCountAttachmentsArgs
    timeEntries?: boolean | TaskCountOutputTypeCountTimeEntriesArgs
    watchers?: boolean | TaskCountOutputTypeCountWatchersArgs
  }

  // Custom InputTypes
  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskCountOutputType
     */
    select?: TaskCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountSubtasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountLabelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskLabelWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountTimeEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimeEntryWhereInput
  }

  /**
   * TaskCountOutputType without action
   */
  export type TaskCountOutputTypeCountWatchersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWatcherWhereInput
  }


  /**
   * Count Type SprintCountOutputType
   */

  export type SprintCountOutputType = {
    tasks: number
  }

  export type SprintCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | SprintCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes
  /**
   * SprintCountOutputType without action
   */
  export type SprintCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SprintCountOutputType
     */
    select?: SprintCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SprintCountOutputType without action
   */
  export type SprintCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }


  /**
   * Count Type EpicCountOutputType
   */

  export type EpicCountOutputType = {
    tasks: number
  }

  export type EpicCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | EpicCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes
  /**
   * EpicCountOutputType without action
   */
  export type EpicCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EpicCountOutputType
     */
    select?: EpicCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EpicCountOutputType without action
   */
  export type EpicCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
  }


  /**
   * Count Type LabelCountOutputType
   */

  export type LabelCountOutputType = {
    tasks: number
  }

  export type LabelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | LabelCountOutputTypeCountTasksArgs
  }

  // Custom InputTypes
  /**
   * LabelCountOutputType without action
   */
  export type LabelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabelCountOutputType
     */
    select?: LabelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LabelCountOutputType without action
   */
  export type LabelCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskLabelWhereInput
  }


  /**
   * Models
   */

  /**
   * Model UserRef
   */

  export type AggregateUserRef = {
    _count: UserRefCountAggregateOutputType | null
    _min: UserRefMinAggregateOutputType | null
    _max: UserRefMaxAggregateOutputType | null
  }

  export type UserRefMinAggregateOutputType = {
    id: string | null
    name: string | null
    avatar: string | null
    updatedAt: Date | null
  }

  export type UserRefMaxAggregateOutputType = {
    id: string | null
    name: string | null
    avatar: string | null
    updatedAt: Date | null
  }

  export type UserRefCountAggregateOutputType = {
    id: number
    name: number
    avatar: number
    updatedAt: number
    _all: number
  }


  export type UserRefMinAggregateInputType = {
    id?: true
    name?: true
    avatar?: true
    updatedAt?: true
  }

  export type UserRefMaxAggregateInputType = {
    id?: true
    name?: true
    avatar?: true
    updatedAt?: true
  }

  export type UserRefCountAggregateInputType = {
    id?: true
    name?: true
    avatar?: true
    updatedAt?: true
    _all?: true
  }

  export type UserRefAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRef to aggregate.
     */
    where?: UserRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRefs to fetch.
     */
    orderBy?: UserRefOrderByWithRelationInput | UserRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserRefs
    **/
    _count?: true | UserRefCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserRefMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserRefMaxAggregateInputType
  }

  export type GetUserRefAggregateType<T extends UserRefAggregateArgs> = {
        [P in keyof T & keyof AggregateUserRef]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserRef[P]>
      : GetScalarType<T[P], AggregateUserRef[P]>
  }




  export type UserRefGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRefWhereInput
    orderBy?: UserRefOrderByWithAggregationInput | UserRefOrderByWithAggregationInput[]
    by: UserRefScalarFieldEnum[] | UserRefScalarFieldEnum
    having?: UserRefScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserRefCountAggregateInputType | true
    _min?: UserRefMinAggregateInputType
    _max?: UserRefMaxAggregateInputType
  }

  export type UserRefGroupByOutputType = {
    id: string
    name: string
    avatar: string | null
    updatedAt: Date
    _count: UserRefCountAggregateOutputType | null
    _min: UserRefMinAggregateOutputType | null
    _max: UserRefMaxAggregateOutputType | null
  }

  type GetUserRefGroupByPayload<T extends UserRefGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserRefGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserRefGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserRefGroupByOutputType[P]>
            : GetScalarType<T[P], UserRefGroupByOutputType[P]>
        }
      >
    >


  export type UserRefSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    avatar?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userRef"]>

  export type UserRefSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    avatar?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userRef"]>

  export type UserRefSelectScalar = {
    id?: boolean
    name?: boolean
    avatar?: boolean
    updatedAt?: boolean
  }


  export type $UserRefPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserRef"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      avatar: string | null
      updatedAt: Date
    }, ExtArgs["result"]["userRef"]>
    composites: {}
  }

  type UserRefGetPayload<S extends boolean | null | undefined | UserRefDefaultArgs> = $Result.GetResult<Prisma.$UserRefPayload, S>

  type UserRefCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserRefFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserRefCountAggregateInputType | true
    }

  export interface UserRefDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserRef'], meta: { name: 'UserRef' } }
    /**
     * Find zero or one UserRef that matches the filter.
     * @param {UserRefFindUniqueArgs} args - Arguments to find a UserRef
     * @example
     * // Get one UserRef
     * const userRef = await prisma.userRef.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserRefFindUniqueArgs>(args: SelectSubset<T, UserRefFindUniqueArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserRef that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserRefFindUniqueOrThrowArgs} args - Arguments to find a UserRef
     * @example
     * // Get one UserRef
     * const userRef = await prisma.userRef.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserRefFindUniqueOrThrowArgs>(args: SelectSubset<T, UserRefFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserRef that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefFindFirstArgs} args - Arguments to find a UserRef
     * @example
     * // Get one UserRef
     * const userRef = await prisma.userRef.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserRefFindFirstArgs>(args?: SelectSubset<T, UserRefFindFirstArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserRef that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefFindFirstOrThrowArgs} args - Arguments to find a UserRef
     * @example
     * // Get one UserRef
     * const userRef = await prisma.userRef.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserRefFindFirstOrThrowArgs>(args?: SelectSubset<T, UserRefFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserRefs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserRefs
     * const userRefs = await prisma.userRef.findMany()
     * 
     * // Get first 10 UserRefs
     * const userRefs = await prisma.userRef.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userRefWithIdOnly = await prisma.userRef.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserRefFindManyArgs>(args?: SelectSubset<T, UserRefFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserRef.
     * @param {UserRefCreateArgs} args - Arguments to create a UserRef.
     * @example
     * // Create one UserRef
     * const UserRef = await prisma.userRef.create({
     *   data: {
     *     // ... data to create a UserRef
     *   }
     * })
     * 
     */
    create<T extends UserRefCreateArgs>(args: SelectSubset<T, UserRefCreateArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserRefs.
     * @param {UserRefCreateManyArgs} args - Arguments to create many UserRefs.
     * @example
     * // Create many UserRefs
     * const userRef = await prisma.userRef.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserRefCreateManyArgs>(args?: SelectSubset<T, UserRefCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserRefs and returns the data saved in the database.
     * @param {UserRefCreateManyAndReturnArgs} args - Arguments to create many UserRefs.
     * @example
     * // Create many UserRefs
     * const userRef = await prisma.userRef.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserRefs and only return the `id`
     * const userRefWithIdOnly = await prisma.userRef.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserRefCreateManyAndReturnArgs>(args?: SelectSubset<T, UserRefCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserRef.
     * @param {UserRefDeleteArgs} args - Arguments to delete one UserRef.
     * @example
     * // Delete one UserRef
     * const UserRef = await prisma.userRef.delete({
     *   where: {
     *     // ... filter to delete one UserRef
     *   }
     * })
     * 
     */
    delete<T extends UserRefDeleteArgs>(args: SelectSubset<T, UserRefDeleteArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserRef.
     * @param {UserRefUpdateArgs} args - Arguments to update one UserRef.
     * @example
     * // Update one UserRef
     * const userRef = await prisma.userRef.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserRefUpdateArgs>(args: SelectSubset<T, UserRefUpdateArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserRefs.
     * @param {UserRefDeleteManyArgs} args - Arguments to filter UserRefs to delete.
     * @example
     * // Delete a few UserRefs
     * const { count } = await prisma.userRef.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserRefDeleteManyArgs>(args?: SelectSubset<T, UserRefDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserRefs
     * const userRef = await prisma.userRef.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserRefUpdateManyArgs>(args: SelectSubset<T, UserRefUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserRef.
     * @param {UserRefUpsertArgs} args - Arguments to update or create a UserRef.
     * @example
     * // Update or create a UserRef
     * const userRef = await prisma.userRef.upsert({
     *   create: {
     *     // ... data to create a UserRef
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserRef we want to update
     *   }
     * })
     */
    upsert<T extends UserRefUpsertArgs>(args: SelectSubset<T, UserRefUpsertArgs<ExtArgs>>): Prisma__UserRefClient<$Result.GetResult<Prisma.$UserRefPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefCountArgs} args - Arguments to filter UserRefs to count.
     * @example
     * // Count the number of UserRefs
     * const count = await prisma.userRef.count({
     *   where: {
     *     // ... the filter for the UserRefs we want to count
     *   }
     * })
    **/
    count<T extends UserRefCountArgs>(
      args?: Subset<T, UserRefCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserRefCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserRefAggregateArgs>(args: Subset<T, UserRefAggregateArgs>): Prisma.PrismaPromise<GetUserRefAggregateType<T>>

    /**
     * Group by UserRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRefGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserRefGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserRefGroupByArgs['orderBy'] }
        : { orderBy?: UserRefGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserRefGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRefGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserRef model
   */
  readonly fields: UserRefFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserRef.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserRefClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserRef model
   */ 
  interface UserRefFieldRefs {
    readonly id: FieldRef<"UserRef", 'String'>
    readonly name: FieldRef<"UserRef", 'String'>
    readonly avatar: FieldRef<"UserRef", 'String'>
    readonly updatedAt: FieldRef<"UserRef", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserRef findUnique
   */
  export type UserRefFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter, which UserRef to fetch.
     */
    where: UserRefWhereUniqueInput
  }

  /**
   * UserRef findUniqueOrThrow
   */
  export type UserRefFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter, which UserRef to fetch.
     */
    where: UserRefWhereUniqueInput
  }

  /**
   * UserRef findFirst
   */
  export type UserRefFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter, which UserRef to fetch.
     */
    where?: UserRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRefs to fetch.
     */
    orderBy?: UserRefOrderByWithRelationInput | UserRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRefs.
     */
    cursor?: UserRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRefs.
     */
    distinct?: UserRefScalarFieldEnum | UserRefScalarFieldEnum[]
  }

  /**
   * UserRef findFirstOrThrow
   */
  export type UserRefFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter, which UserRef to fetch.
     */
    where?: UserRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRefs to fetch.
     */
    orderBy?: UserRefOrderByWithRelationInput | UserRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRefs.
     */
    cursor?: UserRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRefs.
     */
    distinct?: UserRefScalarFieldEnum | UserRefScalarFieldEnum[]
  }

  /**
   * UserRef findMany
   */
  export type UserRefFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter, which UserRefs to fetch.
     */
    where?: UserRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRefs to fetch.
     */
    orderBy?: UserRefOrderByWithRelationInput | UserRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserRefs.
     */
    cursor?: UserRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRefs.
     */
    skip?: number
    distinct?: UserRefScalarFieldEnum | UserRefScalarFieldEnum[]
  }

  /**
   * UserRef create
   */
  export type UserRefCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * The data needed to create a UserRef.
     */
    data: XOR<UserRefCreateInput, UserRefUncheckedCreateInput>
  }

  /**
   * UserRef createMany
   */
  export type UserRefCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserRefs.
     */
    data: UserRefCreateManyInput | UserRefCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRef createManyAndReturn
   */
  export type UserRefCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserRefs.
     */
    data: UserRefCreateManyInput | UserRefCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRef update
   */
  export type UserRefUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * The data needed to update a UserRef.
     */
    data: XOR<UserRefUpdateInput, UserRefUncheckedUpdateInput>
    /**
     * Choose, which UserRef to update.
     */
    where: UserRefWhereUniqueInput
  }

  /**
   * UserRef updateMany
   */
  export type UserRefUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserRefs.
     */
    data: XOR<UserRefUpdateManyMutationInput, UserRefUncheckedUpdateManyInput>
    /**
     * Filter which UserRefs to update
     */
    where?: UserRefWhereInput
  }

  /**
   * UserRef upsert
   */
  export type UserRefUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * The filter to search for the UserRef to update in case it exists.
     */
    where: UserRefWhereUniqueInput
    /**
     * In case the UserRef found by the `where` argument doesn't exist, create a new UserRef with this data.
     */
    create: XOR<UserRefCreateInput, UserRefUncheckedCreateInput>
    /**
     * In case the UserRef was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserRefUpdateInput, UserRefUncheckedUpdateInput>
  }

  /**
   * UserRef delete
   */
  export type UserRefDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
    /**
     * Filter which UserRef to delete.
     */
    where: UserRefWhereUniqueInput
  }

  /**
   * UserRef deleteMany
   */
  export type UserRefDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRefs to delete
     */
    where?: UserRefWhereInput
  }

  /**
   * UserRef without action
   */
  export type UserRefDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRef
     */
    select?: UserRefSelect<ExtArgs> | null
  }


  /**
   * Model Board
   */

  export type AggregateBoard = {
    _count: BoardCountAggregateOutputType | null
    _avg: BoardAvgAggregateOutputType | null
    _sum: BoardSumAggregateOutputType | null
    _min: BoardMinAggregateOutputType | null
    _max: BoardMaxAggregateOutputType | null
  }

  export type BoardAvgAggregateOutputType = {
    lastNumber: number | null
  }

  export type BoardSumAggregateOutputType = {
    lastNumber: number | null
  }

  export type BoardMinAggregateOutputType = {
    id: string | null
    projectId: string | null
    name: string | null
    description: string | null
    keyPrefix: string | null
    lastNumber: number | null
    visibility: $Enums.BoardVisibility | null
    createdBy: string | null
    archived: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BoardMaxAggregateOutputType = {
    id: string | null
    projectId: string | null
    name: string | null
    description: string | null
    keyPrefix: string | null
    lastNumber: number | null
    visibility: $Enums.BoardVisibility | null
    createdBy: string | null
    archived: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BoardCountAggregateOutputType = {
    id: number
    projectId: number
    name: number
    description: number
    keyPrefix: number
    lastNumber: number
    visibility: number
    createdBy: number
    archived: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BoardAvgAggregateInputType = {
    lastNumber?: true
  }

  export type BoardSumAggregateInputType = {
    lastNumber?: true
  }

  export type BoardMinAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    description?: true
    keyPrefix?: true
    lastNumber?: true
    visibility?: true
    createdBy?: true
    archived?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BoardMaxAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    description?: true
    keyPrefix?: true
    lastNumber?: true
    visibility?: true
    createdBy?: true
    archived?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BoardCountAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    description?: true
    keyPrefix?: true
    lastNumber?: true
    visibility?: true
    createdBy?: true
    archived?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BoardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Board to aggregate.
     */
    where?: BoardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Boards to fetch.
     */
    orderBy?: BoardOrderByWithRelationInput | BoardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BoardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Boards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Boards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Boards
    **/
    _count?: true | BoardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BoardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BoardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BoardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BoardMaxAggregateInputType
  }

  export type GetBoardAggregateType<T extends BoardAggregateArgs> = {
        [P in keyof T & keyof AggregateBoard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBoard[P]>
      : GetScalarType<T[P], AggregateBoard[P]>
  }




  export type BoardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BoardWhereInput
    orderBy?: BoardOrderByWithAggregationInput | BoardOrderByWithAggregationInput[]
    by: BoardScalarFieldEnum[] | BoardScalarFieldEnum
    having?: BoardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BoardCountAggregateInputType | true
    _avg?: BoardAvgAggregateInputType
    _sum?: BoardSumAggregateInputType
    _min?: BoardMinAggregateInputType
    _max?: BoardMaxAggregateInputType
  }

  export type BoardGroupByOutputType = {
    id: string
    projectId: string
    name: string
    description: string | null
    keyPrefix: string
    lastNumber: number
    visibility: $Enums.BoardVisibility
    createdBy: string
    archived: boolean
    createdAt: Date
    updatedAt: Date
    _count: BoardCountAggregateOutputType | null
    _avg: BoardAvgAggregateOutputType | null
    _sum: BoardSumAggregateOutputType | null
    _min: BoardMinAggregateOutputType | null
    _max: BoardMaxAggregateOutputType | null
  }

  type GetBoardGroupByPayload<T extends BoardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BoardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BoardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BoardGroupByOutputType[P]>
            : GetScalarType<T[P], BoardGroupByOutputType[P]>
        }
      >
    >


  export type BoardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    name?: boolean
    description?: boolean
    keyPrefix?: boolean
    lastNumber?: boolean
    visibility?: boolean
    createdBy?: boolean
    archived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    columns?: boolean | Board$columnsArgs<ExtArgs>
    tasks?: boolean | Board$tasksArgs<ExtArgs>
    sprints?: boolean | Board$sprintsArgs<ExtArgs>
    epics?: boolean | Board$epicsArgs<ExtArgs>
    labels?: boolean | Board$labelsArgs<ExtArgs>
    activity?: boolean | Board$activityArgs<ExtArgs>
    _count?: boolean | BoardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["board"]>

  export type BoardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    name?: boolean
    description?: boolean
    keyPrefix?: boolean
    lastNumber?: boolean
    visibility?: boolean
    createdBy?: boolean
    archived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["board"]>

  export type BoardSelectScalar = {
    id?: boolean
    projectId?: boolean
    name?: boolean
    description?: boolean
    keyPrefix?: boolean
    lastNumber?: boolean
    visibility?: boolean
    createdBy?: boolean
    archived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BoardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    columns?: boolean | Board$columnsArgs<ExtArgs>
    tasks?: boolean | Board$tasksArgs<ExtArgs>
    sprints?: boolean | Board$sprintsArgs<ExtArgs>
    epics?: boolean | Board$epicsArgs<ExtArgs>
    labels?: boolean | Board$labelsArgs<ExtArgs>
    activity?: boolean | Board$activityArgs<ExtArgs>
    _count?: boolean | BoardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BoardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BoardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Board"
    objects: {
      columns: Prisma.$ColumnPayload<ExtArgs>[]
      tasks: Prisma.$TaskPayload<ExtArgs>[]
      sprints: Prisma.$SprintPayload<ExtArgs>[]
      epics: Prisma.$EpicPayload<ExtArgs>[]
      labels: Prisma.$LabelPayload<ExtArgs>[]
      activity: Prisma.$ActivityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      projectId: string
      name: string
      description: string | null
      /**
       * short prefix for task keys, e.g. "WEB" gives WEB-1, WEB-2
       */
      keyPrefix: string
      /**
       * last task number handed out; incremented atomically so keys never collide
       */
      lastNumber: number
      visibility: $Enums.BoardVisibility
      createdBy: string
      archived: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["board"]>
    composites: {}
  }

  type BoardGetPayload<S extends boolean | null | undefined | BoardDefaultArgs> = $Result.GetResult<Prisma.$BoardPayload, S>

  type BoardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BoardFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BoardCountAggregateInputType | true
    }

  export interface BoardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Board'], meta: { name: 'Board' } }
    /**
     * Find zero or one Board that matches the filter.
     * @param {BoardFindUniqueArgs} args - Arguments to find a Board
     * @example
     * // Get one Board
     * const board = await prisma.board.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BoardFindUniqueArgs>(args: SelectSubset<T, BoardFindUniqueArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Board that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BoardFindUniqueOrThrowArgs} args - Arguments to find a Board
     * @example
     * // Get one Board
     * const board = await prisma.board.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BoardFindUniqueOrThrowArgs>(args: SelectSubset<T, BoardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Board that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardFindFirstArgs} args - Arguments to find a Board
     * @example
     * // Get one Board
     * const board = await prisma.board.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BoardFindFirstArgs>(args?: SelectSubset<T, BoardFindFirstArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Board that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardFindFirstOrThrowArgs} args - Arguments to find a Board
     * @example
     * // Get one Board
     * const board = await prisma.board.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BoardFindFirstOrThrowArgs>(args?: SelectSubset<T, BoardFindFirstOrThrowArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Boards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Boards
     * const boards = await prisma.board.findMany()
     * 
     * // Get first 10 Boards
     * const boards = await prisma.board.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const boardWithIdOnly = await prisma.board.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BoardFindManyArgs>(args?: SelectSubset<T, BoardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Board.
     * @param {BoardCreateArgs} args - Arguments to create a Board.
     * @example
     * // Create one Board
     * const Board = await prisma.board.create({
     *   data: {
     *     // ... data to create a Board
     *   }
     * })
     * 
     */
    create<T extends BoardCreateArgs>(args: SelectSubset<T, BoardCreateArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Boards.
     * @param {BoardCreateManyArgs} args - Arguments to create many Boards.
     * @example
     * // Create many Boards
     * const board = await prisma.board.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BoardCreateManyArgs>(args?: SelectSubset<T, BoardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Boards and returns the data saved in the database.
     * @param {BoardCreateManyAndReturnArgs} args - Arguments to create many Boards.
     * @example
     * // Create many Boards
     * const board = await prisma.board.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Boards and only return the `id`
     * const boardWithIdOnly = await prisma.board.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BoardCreateManyAndReturnArgs>(args?: SelectSubset<T, BoardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Board.
     * @param {BoardDeleteArgs} args - Arguments to delete one Board.
     * @example
     * // Delete one Board
     * const Board = await prisma.board.delete({
     *   where: {
     *     // ... filter to delete one Board
     *   }
     * })
     * 
     */
    delete<T extends BoardDeleteArgs>(args: SelectSubset<T, BoardDeleteArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Board.
     * @param {BoardUpdateArgs} args - Arguments to update one Board.
     * @example
     * // Update one Board
     * const board = await prisma.board.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BoardUpdateArgs>(args: SelectSubset<T, BoardUpdateArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Boards.
     * @param {BoardDeleteManyArgs} args - Arguments to filter Boards to delete.
     * @example
     * // Delete a few Boards
     * const { count } = await prisma.board.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BoardDeleteManyArgs>(args?: SelectSubset<T, BoardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Boards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Boards
     * const board = await prisma.board.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BoardUpdateManyArgs>(args: SelectSubset<T, BoardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Board.
     * @param {BoardUpsertArgs} args - Arguments to update or create a Board.
     * @example
     * // Update or create a Board
     * const board = await prisma.board.upsert({
     *   create: {
     *     // ... data to create a Board
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Board we want to update
     *   }
     * })
     */
    upsert<T extends BoardUpsertArgs>(args: SelectSubset<T, BoardUpsertArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Boards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardCountArgs} args - Arguments to filter Boards to count.
     * @example
     * // Count the number of Boards
     * const count = await prisma.board.count({
     *   where: {
     *     // ... the filter for the Boards we want to count
     *   }
     * })
    **/
    count<T extends BoardCountArgs>(
      args?: Subset<T, BoardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BoardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Board.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BoardAggregateArgs>(args: Subset<T, BoardAggregateArgs>): Prisma.PrismaPromise<GetBoardAggregateType<T>>

    /**
     * Group by Board.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BoardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BoardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BoardGroupByArgs['orderBy'] }
        : { orderBy?: BoardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BoardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBoardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Board model
   */
  readonly fields: BoardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Board.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BoardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    columns<T extends Board$columnsArgs<ExtArgs> = {}>(args?: Subset<T, Board$columnsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findMany"> | Null>
    tasks<T extends Board$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Board$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
    sprints<T extends Board$sprintsArgs<ExtArgs> = {}>(args?: Subset<T, Board$sprintsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findMany"> | Null>
    epics<T extends Board$epicsArgs<ExtArgs> = {}>(args?: Subset<T, Board$epicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findMany"> | Null>
    labels<T extends Board$labelsArgs<ExtArgs> = {}>(args?: Subset<T, Board$labelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findMany"> | Null>
    activity<T extends Board$activityArgs<ExtArgs> = {}>(args?: Subset<T, Board$activityArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Board model
   */ 
  interface BoardFieldRefs {
    readonly id: FieldRef<"Board", 'String'>
    readonly projectId: FieldRef<"Board", 'String'>
    readonly name: FieldRef<"Board", 'String'>
    readonly description: FieldRef<"Board", 'String'>
    readonly keyPrefix: FieldRef<"Board", 'String'>
    readonly lastNumber: FieldRef<"Board", 'Int'>
    readonly visibility: FieldRef<"Board", 'BoardVisibility'>
    readonly createdBy: FieldRef<"Board", 'String'>
    readonly archived: FieldRef<"Board", 'Boolean'>
    readonly createdAt: FieldRef<"Board", 'DateTime'>
    readonly updatedAt: FieldRef<"Board", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Board findUnique
   */
  export type BoardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter, which Board to fetch.
     */
    where: BoardWhereUniqueInput
  }

  /**
   * Board findUniqueOrThrow
   */
  export type BoardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter, which Board to fetch.
     */
    where: BoardWhereUniqueInput
  }

  /**
   * Board findFirst
   */
  export type BoardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter, which Board to fetch.
     */
    where?: BoardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Boards to fetch.
     */
    orderBy?: BoardOrderByWithRelationInput | BoardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Boards.
     */
    cursor?: BoardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Boards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Boards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Boards.
     */
    distinct?: BoardScalarFieldEnum | BoardScalarFieldEnum[]
  }

  /**
   * Board findFirstOrThrow
   */
  export type BoardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter, which Board to fetch.
     */
    where?: BoardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Boards to fetch.
     */
    orderBy?: BoardOrderByWithRelationInput | BoardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Boards.
     */
    cursor?: BoardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Boards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Boards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Boards.
     */
    distinct?: BoardScalarFieldEnum | BoardScalarFieldEnum[]
  }

  /**
   * Board findMany
   */
  export type BoardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter, which Boards to fetch.
     */
    where?: BoardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Boards to fetch.
     */
    orderBy?: BoardOrderByWithRelationInput | BoardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Boards.
     */
    cursor?: BoardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Boards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Boards.
     */
    skip?: number
    distinct?: BoardScalarFieldEnum | BoardScalarFieldEnum[]
  }

  /**
   * Board create
   */
  export type BoardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * The data needed to create a Board.
     */
    data: XOR<BoardCreateInput, BoardUncheckedCreateInput>
  }

  /**
   * Board createMany
   */
  export type BoardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Boards.
     */
    data: BoardCreateManyInput | BoardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Board createManyAndReturn
   */
  export type BoardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Boards.
     */
    data: BoardCreateManyInput | BoardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Board update
   */
  export type BoardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * The data needed to update a Board.
     */
    data: XOR<BoardUpdateInput, BoardUncheckedUpdateInput>
    /**
     * Choose, which Board to update.
     */
    where: BoardWhereUniqueInput
  }

  /**
   * Board updateMany
   */
  export type BoardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Boards.
     */
    data: XOR<BoardUpdateManyMutationInput, BoardUncheckedUpdateManyInput>
    /**
     * Filter which Boards to update
     */
    where?: BoardWhereInput
  }

  /**
   * Board upsert
   */
  export type BoardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * The filter to search for the Board to update in case it exists.
     */
    where: BoardWhereUniqueInput
    /**
     * In case the Board found by the `where` argument doesn't exist, create a new Board with this data.
     */
    create: XOR<BoardCreateInput, BoardUncheckedCreateInput>
    /**
     * In case the Board was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BoardUpdateInput, BoardUncheckedUpdateInput>
  }

  /**
   * Board delete
   */
  export type BoardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
    /**
     * Filter which Board to delete.
     */
    where: BoardWhereUniqueInput
  }

  /**
   * Board deleteMany
   */
  export type BoardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Boards to delete
     */
    where?: BoardWhereInput
  }

  /**
   * Board.columns
   */
  export type Board$columnsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    where?: ColumnWhereInput
    orderBy?: ColumnOrderByWithRelationInput | ColumnOrderByWithRelationInput[]
    cursor?: ColumnWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ColumnScalarFieldEnum | ColumnScalarFieldEnum[]
  }

  /**
   * Board.tasks
   */
  export type Board$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Board.sprints
   */
  export type Board$sprintsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    where?: SprintWhereInput
    orderBy?: SprintOrderByWithRelationInput | SprintOrderByWithRelationInput[]
    cursor?: SprintWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SprintScalarFieldEnum | SprintScalarFieldEnum[]
  }

  /**
   * Board.epics
   */
  export type Board$epicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    where?: EpicWhereInput
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    cursor?: EpicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Board.labels
   */
  export type Board$labelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    where?: LabelWhereInput
    orderBy?: LabelOrderByWithRelationInput | LabelOrderByWithRelationInput[]
    cursor?: LabelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LabelScalarFieldEnum | LabelScalarFieldEnum[]
  }

  /**
   * Board.activity
   */
  export type Board$activityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    where?: ActivityWhereInput
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    cursor?: ActivityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Board without action
   */
  export type BoardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Board
     */
    select?: BoardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BoardInclude<ExtArgs> | null
  }


  /**
   * Model Column
   */

  export type AggregateColumn = {
    _count: ColumnCountAggregateOutputType | null
    _avg: ColumnAvgAggregateOutputType | null
    _sum: ColumnSumAggregateOutputType | null
    _min: ColumnMinAggregateOutputType | null
    _max: ColumnMaxAggregateOutputType | null
  }

  export type ColumnAvgAggregateOutputType = {
    order: number | null
    wipLimit: number | null
  }

  export type ColumnSumAggregateOutputType = {
    order: number | null
    wipLimit: number | null
  }

  export type ColumnMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    color: string | null
    status: $Enums.TaskStatus | null
    order: number | null
    wipLimit: number | null
    createdAt: Date | null
  }

  export type ColumnMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    color: string | null
    status: $Enums.TaskStatus | null
    order: number | null
    wipLimit: number | null
    createdAt: Date | null
  }

  export type ColumnCountAggregateOutputType = {
    id: number
    boardId: number
    name: number
    color: number
    status: number
    order: number
    wipLimit: number
    createdAt: number
    _all: number
  }


  export type ColumnAvgAggregateInputType = {
    order?: true
    wipLimit?: true
  }

  export type ColumnSumAggregateInputType = {
    order?: true
    wipLimit?: true
  }

  export type ColumnMinAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    status?: true
    order?: true
    wipLimit?: true
    createdAt?: true
  }

  export type ColumnMaxAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    status?: true
    order?: true
    wipLimit?: true
    createdAt?: true
  }

  export type ColumnCountAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    status?: true
    order?: true
    wipLimit?: true
    createdAt?: true
    _all?: true
  }

  export type ColumnAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Column to aggregate.
     */
    where?: ColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Columns to fetch.
     */
    orderBy?: ColumnOrderByWithRelationInput | ColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Columns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Columns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Columns
    **/
    _count?: true | ColumnCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ColumnAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ColumnSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ColumnMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ColumnMaxAggregateInputType
  }

  export type GetColumnAggregateType<T extends ColumnAggregateArgs> = {
        [P in keyof T & keyof AggregateColumn]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateColumn[P]>
      : GetScalarType<T[P], AggregateColumn[P]>
  }




  export type ColumnGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColumnWhereInput
    orderBy?: ColumnOrderByWithAggregationInput | ColumnOrderByWithAggregationInput[]
    by: ColumnScalarFieldEnum[] | ColumnScalarFieldEnum
    having?: ColumnScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ColumnCountAggregateInputType | true
    _avg?: ColumnAvgAggregateInputType
    _sum?: ColumnSumAggregateInputType
    _min?: ColumnMinAggregateInputType
    _max?: ColumnMaxAggregateInputType
  }

  export type ColumnGroupByOutputType = {
    id: string
    boardId: string
    name: string
    color: string
    status: $Enums.TaskStatus
    order: number
    wipLimit: number | null
    createdAt: Date
    _count: ColumnCountAggregateOutputType | null
    _avg: ColumnAvgAggregateOutputType | null
    _sum: ColumnSumAggregateOutputType | null
    _min: ColumnMinAggregateOutputType | null
    _max: ColumnMaxAggregateOutputType | null
  }

  type GetColumnGroupByPayload<T extends ColumnGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ColumnGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ColumnGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ColumnGroupByOutputType[P]>
            : GetScalarType<T[P], ColumnGroupByOutputType[P]>
        }
      >
    >


  export type ColumnSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    status?: boolean
    order?: boolean
    wipLimit?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Column$tasksArgs<ExtArgs>
    _count?: boolean | ColumnCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["column"]>

  export type ColumnSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    status?: boolean
    order?: boolean
    wipLimit?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["column"]>

  export type ColumnSelectScalar = {
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    status?: boolean
    order?: boolean
    wipLimit?: boolean
    createdAt?: boolean
  }

  export type ColumnInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Column$tasksArgs<ExtArgs>
    _count?: boolean | ColumnCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ColumnIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }

  export type $ColumnPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Column"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
      tasks: Prisma.$TaskPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      name: string
      color: string
      /**
       * moving a task into this column sets the task to this status
       */
      status: $Enums.TaskStatus
      order: number
      /**
       * work-in-progress limit; null means unlimited
       */
      wipLimit: number | null
      createdAt: Date
    }, ExtArgs["result"]["column"]>
    composites: {}
  }

  type ColumnGetPayload<S extends boolean | null | undefined | ColumnDefaultArgs> = $Result.GetResult<Prisma.$ColumnPayload, S>

  type ColumnCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ColumnFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ColumnCountAggregateInputType | true
    }

  export interface ColumnDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Column'], meta: { name: 'Column' } }
    /**
     * Find zero or one Column that matches the filter.
     * @param {ColumnFindUniqueArgs} args - Arguments to find a Column
     * @example
     * // Get one Column
     * const column = await prisma.column.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ColumnFindUniqueArgs>(args: SelectSubset<T, ColumnFindUniqueArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Column that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ColumnFindUniqueOrThrowArgs} args - Arguments to find a Column
     * @example
     * // Get one Column
     * const column = await prisma.column.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ColumnFindUniqueOrThrowArgs>(args: SelectSubset<T, ColumnFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Column that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnFindFirstArgs} args - Arguments to find a Column
     * @example
     * // Get one Column
     * const column = await prisma.column.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ColumnFindFirstArgs>(args?: SelectSubset<T, ColumnFindFirstArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Column that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnFindFirstOrThrowArgs} args - Arguments to find a Column
     * @example
     * // Get one Column
     * const column = await prisma.column.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ColumnFindFirstOrThrowArgs>(args?: SelectSubset<T, ColumnFindFirstOrThrowArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Columns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Columns
     * const columns = await prisma.column.findMany()
     * 
     * // Get first 10 Columns
     * const columns = await prisma.column.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const columnWithIdOnly = await prisma.column.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ColumnFindManyArgs>(args?: SelectSubset<T, ColumnFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Column.
     * @param {ColumnCreateArgs} args - Arguments to create a Column.
     * @example
     * // Create one Column
     * const Column = await prisma.column.create({
     *   data: {
     *     // ... data to create a Column
     *   }
     * })
     * 
     */
    create<T extends ColumnCreateArgs>(args: SelectSubset<T, ColumnCreateArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Columns.
     * @param {ColumnCreateManyArgs} args - Arguments to create many Columns.
     * @example
     * // Create many Columns
     * const column = await prisma.column.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ColumnCreateManyArgs>(args?: SelectSubset<T, ColumnCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Columns and returns the data saved in the database.
     * @param {ColumnCreateManyAndReturnArgs} args - Arguments to create many Columns.
     * @example
     * // Create many Columns
     * const column = await prisma.column.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Columns and only return the `id`
     * const columnWithIdOnly = await prisma.column.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ColumnCreateManyAndReturnArgs>(args?: SelectSubset<T, ColumnCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Column.
     * @param {ColumnDeleteArgs} args - Arguments to delete one Column.
     * @example
     * // Delete one Column
     * const Column = await prisma.column.delete({
     *   where: {
     *     // ... filter to delete one Column
     *   }
     * })
     * 
     */
    delete<T extends ColumnDeleteArgs>(args: SelectSubset<T, ColumnDeleteArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Column.
     * @param {ColumnUpdateArgs} args - Arguments to update one Column.
     * @example
     * // Update one Column
     * const column = await prisma.column.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ColumnUpdateArgs>(args: SelectSubset<T, ColumnUpdateArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Columns.
     * @param {ColumnDeleteManyArgs} args - Arguments to filter Columns to delete.
     * @example
     * // Delete a few Columns
     * const { count } = await prisma.column.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ColumnDeleteManyArgs>(args?: SelectSubset<T, ColumnDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Columns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Columns
     * const column = await prisma.column.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ColumnUpdateManyArgs>(args: SelectSubset<T, ColumnUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Column.
     * @param {ColumnUpsertArgs} args - Arguments to update or create a Column.
     * @example
     * // Update or create a Column
     * const column = await prisma.column.upsert({
     *   create: {
     *     // ... data to create a Column
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Column we want to update
     *   }
     * })
     */
    upsert<T extends ColumnUpsertArgs>(args: SelectSubset<T, ColumnUpsertArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Columns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnCountArgs} args - Arguments to filter Columns to count.
     * @example
     * // Count the number of Columns
     * const count = await prisma.column.count({
     *   where: {
     *     // ... the filter for the Columns we want to count
     *   }
     * })
    **/
    count<T extends ColumnCountArgs>(
      args?: Subset<T, ColumnCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ColumnCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Column.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ColumnAggregateArgs>(args: Subset<T, ColumnAggregateArgs>): Prisma.PrismaPromise<GetColumnAggregateType<T>>

    /**
     * Group by Column.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColumnGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ColumnGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ColumnGroupByArgs['orderBy'] }
        : { orderBy?: ColumnGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ColumnGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetColumnGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Column model
   */
  readonly fields: ColumnFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Column.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ColumnClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tasks<T extends Column$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Column$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Column model
   */ 
  interface ColumnFieldRefs {
    readonly id: FieldRef<"Column", 'String'>
    readonly boardId: FieldRef<"Column", 'String'>
    readonly name: FieldRef<"Column", 'String'>
    readonly color: FieldRef<"Column", 'String'>
    readonly status: FieldRef<"Column", 'TaskStatus'>
    readonly order: FieldRef<"Column", 'Float'>
    readonly wipLimit: FieldRef<"Column", 'Int'>
    readonly createdAt: FieldRef<"Column", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Column findUnique
   */
  export type ColumnFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter, which Column to fetch.
     */
    where: ColumnWhereUniqueInput
  }

  /**
   * Column findUniqueOrThrow
   */
  export type ColumnFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter, which Column to fetch.
     */
    where: ColumnWhereUniqueInput
  }

  /**
   * Column findFirst
   */
  export type ColumnFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter, which Column to fetch.
     */
    where?: ColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Columns to fetch.
     */
    orderBy?: ColumnOrderByWithRelationInput | ColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Columns.
     */
    cursor?: ColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Columns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Columns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Columns.
     */
    distinct?: ColumnScalarFieldEnum | ColumnScalarFieldEnum[]
  }

  /**
   * Column findFirstOrThrow
   */
  export type ColumnFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter, which Column to fetch.
     */
    where?: ColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Columns to fetch.
     */
    orderBy?: ColumnOrderByWithRelationInput | ColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Columns.
     */
    cursor?: ColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Columns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Columns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Columns.
     */
    distinct?: ColumnScalarFieldEnum | ColumnScalarFieldEnum[]
  }

  /**
   * Column findMany
   */
  export type ColumnFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter, which Columns to fetch.
     */
    where?: ColumnWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Columns to fetch.
     */
    orderBy?: ColumnOrderByWithRelationInput | ColumnOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Columns.
     */
    cursor?: ColumnWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Columns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Columns.
     */
    skip?: number
    distinct?: ColumnScalarFieldEnum | ColumnScalarFieldEnum[]
  }

  /**
   * Column create
   */
  export type ColumnCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * The data needed to create a Column.
     */
    data: XOR<ColumnCreateInput, ColumnUncheckedCreateInput>
  }

  /**
   * Column createMany
   */
  export type ColumnCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Columns.
     */
    data: ColumnCreateManyInput | ColumnCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Column createManyAndReturn
   */
  export type ColumnCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Columns.
     */
    data: ColumnCreateManyInput | ColumnCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Column update
   */
  export type ColumnUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * The data needed to update a Column.
     */
    data: XOR<ColumnUpdateInput, ColumnUncheckedUpdateInput>
    /**
     * Choose, which Column to update.
     */
    where: ColumnWhereUniqueInput
  }

  /**
   * Column updateMany
   */
  export type ColumnUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Columns.
     */
    data: XOR<ColumnUpdateManyMutationInput, ColumnUncheckedUpdateManyInput>
    /**
     * Filter which Columns to update
     */
    where?: ColumnWhereInput
  }

  /**
   * Column upsert
   */
  export type ColumnUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * The filter to search for the Column to update in case it exists.
     */
    where: ColumnWhereUniqueInput
    /**
     * In case the Column found by the `where` argument doesn't exist, create a new Column with this data.
     */
    create: XOR<ColumnCreateInput, ColumnUncheckedCreateInput>
    /**
     * In case the Column was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ColumnUpdateInput, ColumnUncheckedUpdateInput>
  }

  /**
   * Column delete
   */
  export type ColumnDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
    /**
     * Filter which Column to delete.
     */
    where: ColumnWhereUniqueInput
  }

  /**
   * Column deleteMany
   */
  export type ColumnDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Columns to delete
     */
    where?: ColumnWhereInput
  }

  /**
   * Column.tasks
   */
  export type Column$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Column without action
   */
  export type ColumnDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Column
     */
    select?: ColumnSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColumnInclude<ExtArgs> | null
  }


  /**
   * Model Task
   */

  export type AggregateTask = {
    _count: TaskCountAggregateOutputType | null
    _avg: TaskAvgAggregateOutputType | null
    _sum: TaskSumAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  export type TaskAvgAggregateOutputType = {
    number: number | null
    points: number | null
    estimatedHours: number | null
    order: number | null
  }

  export type TaskSumAggregateOutputType = {
    number: number | null
    points: number | null
    estimatedHours: number | null
    order: number | null
  }

  export type TaskMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    columnId: string | null
    sprintId: string | null
    epicId: string | null
    parentId: string | null
    number: number | null
    key: string | null
    title: string | null
    description: string | null
    type: $Enums.TaskType | null
    priority: $Enums.Priority | null
    status: $Enums.TaskStatus | null
    points: number | null
    estimatedHours: number | null
    order: number | null
    dueDate: Date | null
    completedAt: Date | null
    assigneeId: string | null
    reporterId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    columnId: string | null
    sprintId: string | null
    epicId: string | null
    parentId: string | null
    number: number | null
    key: string | null
    title: string | null
    description: string | null
    type: $Enums.TaskType | null
    priority: $Enums.Priority | null
    status: $Enums.TaskStatus | null
    points: number | null
    estimatedHours: number | null
    order: number | null
    dueDate: Date | null
    completedAt: Date | null
    assigneeId: string | null
    reporterId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TaskCountAggregateOutputType = {
    id: number
    boardId: number
    columnId: number
    sprintId: number
    epicId: number
    parentId: number
    number: number
    key: number
    title: number
    description: number
    type: number
    priority: number
    status: number
    points: number
    estimatedHours: number
    order: number
    dueDate: number
    completedAt: number
    assigneeId: number
    reporterId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TaskAvgAggregateInputType = {
    number?: true
    points?: true
    estimatedHours?: true
    order?: true
  }

  export type TaskSumAggregateInputType = {
    number?: true
    points?: true
    estimatedHours?: true
    order?: true
  }

  export type TaskMinAggregateInputType = {
    id?: true
    boardId?: true
    columnId?: true
    sprintId?: true
    epicId?: true
    parentId?: true
    number?: true
    key?: true
    title?: true
    description?: true
    type?: true
    priority?: true
    status?: true
    points?: true
    estimatedHours?: true
    order?: true
    dueDate?: true
    completedAt?: true
    assigneeId?: true
    reporterId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskMaxAggregateInputType = {
    id?: true
    boardId?: true
    columnId?: true
    sprintId?: true
    epicId?: true
    parentId?: true
    number?: true
    key?: true
    title?: true
    description?: true
    type?: true
    priority?: true
    status?: true
    points?: true
    estimatedHours?: true
    order?: true
    dueDate?: true
    completedAt?: true
    assigneeId?: true
    reporterId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TaskCountAggregateInputType = {
    id?: true
    boardId?: true
    columnId?: true
    sprintId?: true
    epicId?: true
    parentId?: true
    number?: true
    key?: true
    title?: true
    description?: true
    type?: true
    priority?: true
    status?: true
    points?: true
    estimatedHours?: true
    order?: true
    dueDate?: true
    completedAt?: true
    assigneeId?: true
    reporterId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Task to aggregate.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tasks
    **/
    _count?: true | TaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TaskAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TaskSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskMaxAggregateInputType
  }

  export type GetTaskAggregateType<T extends TaskAggregateArgs> = {
        [P in keyof T & keyof AggregateTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTask[P]>
      : GetScalarType<T[P], AggregateTask[P]>
  }




  export type TaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithAggregationInput | TaskOrderByWithAggregationInput[]
    by: TaskScalarFieldEnum[] | TaskScalarFieldEnum
    having?: TaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskCountAggregateInputType | true
    _avg?: TaskAvgAggregateInputType
    _sum?: TaskSumAggregateInputType
    _min?: TaskMinAggregateInputType
    _max?: TaskMaxAggregateInputType
  }

  export type TaskGroupByOutputType = {
    id: string
    boardId: string
    columnId: string
    sprintId: string | null
    epicId: string | null
    parentId: string | null
    number: number
    key: string
    title: string
    description: string | null
    type: $Enums.TaskType
    priority: $Enums.Priority
    status: $Enums.TaskStatus
    points: number | null
    estimatedHours: number | null
    order: number
    dueDate: Date | null
    completedAt: Date | null
    assigneeId: string | null
    reporterId: string
    createdAt: Date
    updatedAt: Date
    _count: TaskCountAggregateOutputType | null
    _avg: TaskAvgAggregateOutputType | null
    _sum: TaskSumAggregateOutputType | null
    _min: TaskMinAggregateOutputType | null
    _max: TaskMaxAggregateOutputType | null
  }

  type GetTaskGroupByPayload<T extends TaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskGroupByOutputType[P]>
            : GetScalarType<T[P], TaskGroupByOutputType[P]>
        }
      >
    >


  export type TaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    columnId?: boolean
    sprintId?: boolean
    epicId?: boolean
    parentId?: boolean
    number?: boolean
    key?: boolean
    title?: boolean
    description?: boolean
    type?: boolean
    priority?: boolean
    status?: boolean
    points?: boolean
    estimatedHours?: boolean
    order?: boolean
    dueDate?: boolean
    completedAt?: boolean
    assigneeId?: boolean
    reporterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    column?: boolean | ColumnDefaultArgs<ExtArgs>
    sprint?: boolean | Task$sprintArgs<ExtArgs>
    epic?: boolean | Task$epicArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
    subtasks?: boolean | Task$subtasksArgs<ExtArgs>
    labels?: boolean | Task$labelsArgs<ExtArgs>
    comments?: boolean | Task$commentsArgs<ExtArgs>
    attachments?: boolean | Task$attachmentsArgs<ExtArgs>
    timeEntries?: boolean | Task$timeEntriesArgs<ExtArgs>
    watchers?: boolean | Task$watchersArgs<ExtArgs>
    _count?: boolean | TaskCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    columnId?: boolean
    sprintId?: boolean
    epicId?: boolean
    parentId?: boolean
    number?: boolean
    key?: boolean
    title?: boolean
    description?: boolean
    type?: boolean
    priority?: boolean
    status?: boolean
    points?: boolean
    estimatedHours?: boolean
    order?: boolean
    dueDate?: boolean
    completedAt?: boolean
    assigneeId?: boolean
    reporterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    column?: boolean | ColumnDefaultArgs<ExtArgs>
    sprint?: boolean | Task$sprintArgs<ExtArgs>
    epic?: boolean | Task$epicArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
  }, ExtArgs["result"]["task"]>

  export type TaskSelectScalar = {
    id?: boolean
    boardId?: boolean
    columnId?: boolean
    sprintId?: boolean
    epicId?: boolean
    parentId?: boolean
    number?: boolean
    key?: boolean
    title?: boolean
    description?: boolean
    type?: boolean
    priority?: boolean
    status?: boolean
    points?: boolean
    estimatedHours?: boolean
    order?: boolean
    dueDate?: boolean
    completedAt?: boolean
    assigneeId?: boolean
    reporterId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    column?: boolean | ColumnDefaultArgs<ExtArgs>
    sprint?: boolean | Task$sprintArgs<ExtArgs>
    epic?: boolean | Task$epicArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
    subtasks?: boolean | Task$subtasksArgs<ExtArgs>
    labels?: boolean | Task$labelsArgs<ExtArgs>
    comments?: boolean | Task$commentsArgs<ExtArgs>
    attachments?: boolean | Task$attachmentsArgs<ExtArgs>
    timeEntries?: boolean | Task$timeEntriesArgs<ExtArgs>
    watchers?: boolean | Task$watchersArgs<ExtArgs>
    _count?: boolean | TaskCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    column?: boolean | ColumnDefaultArgs<ExtArgs>
    sprint?: boolean | Task$sprintArgs<ExtArgs>
    epic?: boolean | Task$epicArgs<ExtArgs>
    parent?: boolean | Task$parentArgs<ExtArgs>
  }

  export type $TaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Task"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
      column: Prisma.$ColumnPayload<ExtArgs>
      sprint: Prisma.$SprintPayload<ExtArgs> | null
      epic: Prisma.$EpicPayload<ExtArgs> | null
      parent: Prisma.$TaskPayload<ExtArgs> | null
      subtasks: Prisma.$TaskPayload<ExtArgs>[]
      labels: Prisma.$TaskLabelPayload<ExtArgs>[]
      comments: Prisma.$CommentPayload<ExtArgs>[]
      attachments: Prisma.$AttachmentPayload<ExtArgs>[]
      timeEntries: Prisma.$TimeEntryPayload<ExtArgs>[]
      watchers: Prisma.$TaskWatcherPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      columnId: string
      sprintId: string | null
      epicId: string | null
      parentId: string | null
      number: number
      key: string
      title: string
      description: string | null
      type: $Enums.TaskType
      priority: $Enums.Priority
      status: $Enums.TaskStatus
      points: number | null
      estimatedHours: number | null
      /**
       * fractional position inside the column: moving a card only rewrites that one card
       */
      order: number
      dueDate: Date | null
      completedAt: Date | null
      assigneeId: string | null
      reporterId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["task"]>
    composites: {}
  }

  type TaskGetPayload<S extends boolean | null | undefined | TaskDefaultArgs> = $Result.GetResult<Prisma.$TaskPayload, S>

  type TaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TaskFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TaskCountAggregateInputType | true
    }

  export interface TaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Task'], meta: { name: 'Task' } }
    /**
     * Find zero or one Task that matches the filter.
     * @param {TaskFindUniqueArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaskFindUniqueArgs>(args: SelectSubset<T, TaskFindUniqueArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Task that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TaskFindUniqueOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaskFindUniqueOrThrowArgs>(args: SelectSubset<T, TaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Task that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaskFindFirstArgs>(args?: SelectSubset<T, TaskFindFirstArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Task that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindFirstOrThrowArgs} args - Arguments to find a Task
     * @example
     * // Get one Task
     * const task = await prisma.task.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaskFindFirstOrThrowArgs>(args?: SelectSubset<T, TaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tasks
     * const tasks = await prisma.task.findMany()
     * 
     * // Get first 10 Tasks
     * const tasks = await prisma.task.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const taskWithIdOnly = await prisma.task.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TaskFindManyArgs>(args?: SelectSubset<T, TaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Task.
     * @param {TaskCreateArgs} args - Arguments to create a Task.
     * @example
     * // Create one Task
     * const Task = await prisma.task.create({
     *   data: {
     *     // ... data to create a Task
     *   }
     * })
     * 
     */
    create<T extends TaskCreateArgs>(args: SelectSubset<T, TaskCreateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tasks.
     * @param {TaskCreateManyArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaskCreateManyArgs>(args?: SelectSubset<T, TaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tasks and returns the data saved in the database.
     * @param {TaskCreateManyAndReturnArgs} args - Arguments to create many Tasks.
     * @example
     * // Create many Tasks
     * const task = await prisma.task.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tasks and only return the `id`
     * const taskWithIdOnly = await prisma.task.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaskCreateManyAndReturnArgs>(args?: SelectSubset<T, TaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Task.
     * @param {TaskDeleteArgs} args - Arguments to delete one Task.
     * @example
     * // Delete one Task
     * const Task = await prisma.task.delete({
     *   where: {
     *     // ... filter to delete one Task
     *   }
     * })
     * 
     */
    delete<T extends TaskDeleteArgs>(args: SelectSubset<T, TaskDeleteArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Task.
     * @param {TaskUpdateArgs} args - Arguments to update one Task.
     * @example
     * // Update one Task
     * const task = await prisma.task.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaskUpdateArgs>(args: SelectSubset<T, TaskUpdateArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tasks.
     * @param {TaskDeleteManyArgs} args - Arguments to filter Tasks to delete.
     * @example
     * // Delete a few Tasks
     * const { count } = await prisma.task.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaskDeleteManyArgs>(args?: SelectSubset<T, TaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tasks
     * const task = await prisma.task.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaskUpdateManyArgs>(args: SelectSubset<T, TaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Task.
     * @param {TaskUpsertArgs} args - Arguments to update or create a Task.
     * @example
     * // Update or create a Task
     * const task = await prisma.task.upsert({
     *   create: {
     *     // ... data to create a Task
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Task we want to update
     *   }
     * })
     */
    upsert<T extends TaskUpsertArgs>(args: SelectSubset<T, TaskUpsertArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskCountArgs} args - Arguments to filter Tasks to count.
     * @example
     * // Count the number of Tasks
     * const count = await prisma.task.count({
     *   where: {
     *     // ... the filter for the Tasks we want to count
     *   }
     * })
    **/
    count<T extends TaskCountArgs>(
      args?: Subset<T, TaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaskAggregateArgs>(args: Subset<T, TaskAggregateArgs>): Prisma.PrismaPromise<GetTaskAggregateType<T>>

    /**
     * Group by Task.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskGroupByArgs['orderBy'] }
        : { orderBy?: TaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Task model
   */
  readonly fields: TaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Task.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    column<T extends ColumnDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ColumnDefaultArgs<ExtArgs>>): Prisma__ColumnClient<$Result.GetResult<Prisma.$ColumnPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    sprint<T extends Task$sprintArgs<ExtArgs> = {}>(args?: Subset<T, Task$sprintArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    epic<T extends Task$epicArgs<ExtArgs> = {}>(args?: Subset<T, Task$epicArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    parent<T extends Task$parentArgs<ExtArgs> = {}>(args?: Subset<T, Task$parentArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    subtasks<T extends Task$subtasksArgs<ExtArgs> = {}>(args?: Subset<T, Task$subtasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
    labels<T extends Task$labelsArgs<ExtArgs> = {}>(args?: Subset<T, Task$labelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findMany"> | Null>
    comments<T extends Task$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Task$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany"> | Null>
    attachments<T extends Task$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, Task$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany"> | Null>
    timeEntries<T extends Task$timeEntriesArgs<ExtArgs> = {}>(args?: Subset<T, Task$timeEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findMany"> | Null>
    watchers<T extends Task$watchersArgs<ExtArgs> = {}>(args?: Subset<T, Task$watchersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Task model
   */ 
  interface TaskFieldRefs {
    readonly id: FieldRef<"Task", 'String'>
    readonly boardId: FieldRef<"Task", 'String'>
    readonly columnId: FieldRef<"Task", 'String'>
    readonly sprintId: FieldRef<"Task", 'String'>
    readonly epicId: FieldRef<"Task", 'String'>
    readonly parentId: FieldRef<"Task", 'String'>
    readonly number: FieldRef<"Task", 'Int'>
    readonly key: FieldRef<"Task", 'String'>
    readonly title: FieldRef<"Task", 'String'>
    readonly description: FieldRef<"Task", 'String'>
    readonly type: FieldRef<"Task", 'TaskType'>
    readonly priority: FieldRef<"Task", 'Priority'>
    readonly status: FieldRef<"Task", 'TaskStatus'>
    readonly points: FieldRef<"Task", 'Int'>
    readonly estimatedHours: FieldRef<"Task", 'Float'>
    readonly order: FieldRef<"Task", 'Float'>
    readonly dueDate: FieldRef<"Task", 'DateTime'>
    readonly completedAt: FieldRef<"Task", 'DateTime'>
    readonly assigneeId: FieldRef<"Task", 'String'>
    readonly reporterId: FieldRef<"Task", 'String'>
    readonly createdAt: FieldRef<"Task", 'DateTime'>
    readonly updatedAt: FieldRef<"Task", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Task findUnique
   */
  export type TaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findUniqueOrThrow
   */
  export type TaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task findFirst
   */
  export type TaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findFirstOrThrow
   */
  export type TaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Task to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tasks.
     */
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task findMany
   */
  export type TaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter, which Tasks to fetch.
     */
    where?: TaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tasks to fetch.
     */
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tasks.
     */
    cursor?: TaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tasks.
     */
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task create
   */
  export type TaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to create a Task.
     */
    data: XOR<TaskCreateInput, TaskUncheckedCreateInput>
  }

  /**
   * Task createMany
   */
  export type TaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Task createManyAndReturn
   */
  export type TaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tasks.
     */
    data: TaskCreateManyInput | TaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Task update
   */
  export type TaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The data needed to update a Task.
     */
    data: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
    /**
     * Choose, which Task to update.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task updateMany
   */
  export type TaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tasks.
     */
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyInput>
    /**
     * Filter which Tasks to update
     */
    where?: TaskWhereInput
  }

  /**
   * Task upsert
   */
  export type TaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * The filter to search for the Task to update in case it exists.
     */
    where: TaskWhereUniqueInput
    /**
     * In case the Task found by the `where` argument doesn't exist, create a new Task with this data.
     */
    create: XOR<TaskCreateInput, TaskUncheckedCreateInput>
    /**
     * In case the Task was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskUpdateInput, TaskUncheckedUpdateInput>
  }

  /**
   * Task delete
   */
  export type TaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    /**
     * Filter which Task to delete.
     */
    where: TaskWhereUniqueInput
  }

  /**
   * Task deleteMany
   */
  export type TaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tasks to delete
     */
    where?: TaskWhereInput
  }

  /**
   * Task.sprint
   */
  export type Task$sprintArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    where?: SprintWhereInput
  }

  /**
   * Task.epic
   */
  export type Task$epicArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    where?: EpicWhereInput
  }

  /**
   * Task.parent
   */
  export type Task$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
  }

  /**
   * Task.subtasks
   */
  export type Task$subtasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Task.labels
   */
  export type Task$labelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    where?: TaskLabelWhereInput
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    cursor?: TaskLabelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskLabelScalarFieldEnum | TaskLabelScalarFieldEnum[]
  }

  /**
   * Task.comments
   */
  export type Task$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Task.attachments
   */
  export type Task$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    cursor?: AttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Task.timeEntries
   */
  export type Task$timeEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    where?: TimeEntryWhereInput
    orderBy?: TimeEntryOrderByWithRelationInput | TimeEntryOrderByWithRelationInput[]
    cursor?: TimeEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TimeEntryScalarFieldEnum | TimeEntryScalarFieldEnum[]
  }

  /**
   * Task.watchers
   */
  export type Task$watchersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    where?: TaskWatcherWhereInput
    orderBy?: TaskWatcherOrderByWithRelationInput | TaskWatcherOrderByWithRelationInput[]
    cursor?: TaskWatcherWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskWatcherScalarFieldEnum | TaskWatcherScalarFieldEnum[]
  }

  /**
   * Task without action
   */
  export type TaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
  }


  /**
   * Model Sprint
   */

  export type AggregateSprint = {
    _count: SprintCountAggregateOutputType | null
    _avg: SprintAvgAggregateOutputType | null
    _sum: SprintSumAggregateOutputType | null
    _min: SprintMinAggregateOutputType | null
    _max: SprintMaxAggregateOutputType | null
  }

  export type SprintAvgAggregateOutputType = {
    committedPoints: number | null
    completedPoints: number | null
  }

  export type SprintSumAggregateOutputType = {
    committedPoints: number | null
    completedPoints: number | null
  }

  export type SprintMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    goal: string | null
    startDate: Date | null
    endDate: Date | null
    status: $Enums.SprintStatus | null
    committedPoints: number | null
    completedPoints: number | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type SprintMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    goal: string | null
    startDate: Date | null
    endDate: Date | null
    status: $Enums.SprintStatus | null
    committedPoints: number | null
    completedPoints: number | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type SprintCountAggregateOutputType = {
    id: number
    boardId: number
    name: number
    goal: number
    startDate: number
    endDate: number
    status: number
    committedPoints: number
    completedPoints: number
    startedAt: number
    completedAt: number
    createdAt: number
    _all: number
  }


  export type SprintAvgAggregateInputType = {
    committedPoints?: true
    completedPoints?: true
  }

  export type SprintSumAggregateInputType = {
    committedPoints?: true
    completedPoints?: true
  }

  export type SprintMinAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    goal?: true
    startDate?: true
    endDate?: true
    status?: true
    committedPoints?: true
    completedPoints?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type SprintMaxAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    goal?: true
    startDate?: true
    endDate?: true
    status?: true
    committedPoints?: true
    completedPoints?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type SprintCountAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    goal?: true
    startDate?: true
    endDate?: true
    status?: true
    committedPoints?: true
    completedPoints?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    _all?: true
  }

  export type SprintAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sprint to aggregate.
     */
    where?: SprintWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sprints to fetch.
     */
    orderBy?: SprintOrderByWithRelationInput | SprintOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SprintWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sprints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sprints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sprints
    **/
    _count?: true | SprintCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SprintAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SprintSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SprintMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SprintMaxAggregateInputType
  }

  export type GetSprintAggregateType<T extends SprintAggregateArgs> = {
        [P in keyof T & keyof AggregateSprint]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSprint[P]>
      : GetScalarType<T[P], AggregateSprint[P]>
  }




  export type SprintGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SprintWhereInput
    orderBy?: SprintOrderByWithAggregationInput | SprintOrderByWithAggregationInput[]
    by: SprintScalarFieldEnum[] | SprintScalarFieldEnum
    having?: SprintScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SprintCountAggregateInputType | true
    _avg?: SprintAvgAggregateInputType
    _sum?: SprintSumAggregateInputType
    _min?: SprintMinAggregateInputType
    _max?: SprintMaxAggregateInputType
  }

  export type SprintGroupByOutputType = {
    id: string
    boardId: string
    name: string
    goal: string | null
    startDate: Date
    endDate: Date
    status: $Enums.SprintStatus
    committedPoints: number | null
    completedPoints: number | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date
    _count: SprintCountAggregateOutputType | null
    _avg: SprintAvgAggregateOutputType | null
    _sum: SprintSumAggregateOutputType | null
    _min: SprintMinAggregateOutputType | null
    _max: SprintMaxAggregateOutputType | null
  }

  type GetSprintGroupByPayload<T extends SprintGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SprintGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SprintGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SprintGroupByOutputType[P]>
            : GetScalarType<T[P], SprintGroupByOutputType[P]>
        }
      >
    >


  export type SprintSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    goal?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    committedPoints?: boolean
    completedPoints?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Sprint$tasksArgs<ExtArgs>
    _count?: boolean | SprintCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sprint"]>

  export type SprintSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    goal?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    committedPoints?: boolean
    completedPoints?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sprint"]>

  export type SprintSelectScalar = {
    id?: boolean
    boardId?: boolean
    name?: boolean
    goal?: boolean
    startDate?: boolean
    endDate?: boolean
    status?: boolean
    committedPoints?: boolean
    completedPoints?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }

  export type SprintInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Sprint$tasksArgs<ExtArgs>
    _count?: boolean | SprintCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SprintIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }

  export type $SprintPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sprint"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
      tasks: Prisma.$TaskPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      name: string
      goal: string | null
      startDate: Date
      endDate: Date
      status: $Enums.SprintStatus
      committedPoints: number | null
      completedPoints: number | null
      startedAt: Date | null
      completedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["sprint"]>
    composites: {}
  }

  type SprintGetPayload<S extends boolean | null | undefined | SprintDefaultArgs> = $Result.GetResult<Prisma.$SprintPayload, S>

  type SprintCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SprintFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SprintCountAggregateInputType | true
    }

  export interface SprintDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sprint'], meta: { name: 'Sprint' } }
    /**
     * Find zero or one Sprint that matches the filter.
     * @param {SprintFindUniqueArgs} args - Arguments to find a Sprint
     * @example
     * // Get one Sprint
     * const sprint = await prisma.sprint.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SprintFindUniqueArgs>(args: SelectSubset<T, SprintFindUniqueArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Sprint that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SprintFindUniqueOrThrowArgs} args - Arguments to find a Sprint
     * @example
     * // Get one Sprint
     * const sprint = await prisma.sprint.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SprintFindUniqueOrThrowArgs>(args: SelectSubset<T, SprintFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Sprint that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintFindFirstArgs} args - Arguments to find a Sprint
     * @example
     * // Get one Sprint
     * const sprint = await prisma.sprint.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SprintFindFirstArgs>(args?: SelectSubset<T, SprintFindFirstArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Sprint that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintFindFirstOrThrowArgs} args - Arguments to find a Sprint
     * @example
     * // Get one Sprint
     * const sprint = await prisma.sprint.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SprintFindFirstOrThrowArgs>(args?: SelectSubset<T, SprintFindFirstOrThrowArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Sprints that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sprints
     * const sprints = await prisma.sprint.findMany()
     * 
     * // Get first 10 Sprints
     * const sprints = await prisma.sprint.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sprintWithIdOnly = await prisma.sprint.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SprintFindManyArgs>(args?: SelectSubset<T, SprintFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Sprint.
     * @param {SprintCreateArgs} args - Arguments to create a Sprint.
     * @example
     * // Create one Sprint
     * const Sprint = await prisma.sprint.create({
     *   data: {
     *     // ... data to create a Sprint
     *   }
     * })
     * 
     */
    create<T extends SprintCreateArgs>(args: SelectSubset<T, SprintCreateArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Sprints.
     * @param {SprintCreateManyArgs} args - Arguments to create many Sprints.
     * @example
     * // Create many Sprints
     * const sprint = await prisma.sprint.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SprintCreateManyArgs>(args?: SelectSubset<T, SprintCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sprints and returns the data saved in the database.
     * @param {SprintCreateManyAndReturnArgs} args - Arguments to create many Sprints.
     * @example
     * // Create many Sprints
     * const sprint = await prisma.sprint.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sprints and only return the `id`
     * const sprintWithIdOnly = await prisma.sprint.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SprintCreateManyAndReturnArgs>(args?: SelectSubset<T, SprintCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Sprint.
     * @param {SprintDeleteArgs} args - Arguments to delete one Sprint.
     * @example
     * // Delete one Sprint
     * const Sprint = await prisma.sprint.delete({
     *   where: {
     *     // ... filter to delete one Sprint
     *   }
     * })
     * 
     */
    delete<T extends SprintDeleteArgs>(args: SelectSubset<T, SprintDeleteArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Sprint.
     * @param {SprintUpdateArgs} args - Arguments to update one Sprint.
     * @example
     * // Update one Sprint
     * const sprint = await prisma.sprint.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SprintUpdateArgs>(args: SelectSubset<T, SprintUpdateArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Sprints.
     * @param {SprintDeleteManyArgs} args - Arguments to filter Sprints to delete.
     * @example
     * // Delete a few Sprints
     * const { count } = await prisma.sprint.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SprintDeleteManyArgs>(args?: SelectSubset<T, SprintDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sprints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sprints
     * const sprint = await prisma.sprint.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SprintUpdateManyArgs>(args: SelectSubset<T, SprintUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sprint.
     * @param {SprintUpsertArgs} args - Arguments to update or create a Sprint.
     * @example
     * // Update or create a Sprint
     * const sprint = await prisma.sprint.upsert({
     *   create: {
     *     // ... data to create a Sprint
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sprint we want to update
     *   }
     * })
     */
    upsert<T extends SprintUpsertArgs>(args: SelectSubset<T, SprintUpsertArgs<ExtArgs>>): Prisma__SprintClient<$Result.GetResult<Prisma.$SprintPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Sprints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintCountArgs} args - Arguments to filter Sprints to count.
     * @example
     * // Count the number of Sprints
     * const count = await prisma.sprint.count({
     *   where: {
     *     // ... the filter for the Sprints we want to count
     *   }
     * })
    **/
    count<T extends SprintCountArgs>(
      args?: Subset<T, SprintCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SprintCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sprint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SprintAggregateArgs>(args: Subset<T, SprintAggregateArgs>): Prisma.PrismaPromise<GetSprintAggregateType<T>>

    /**
     * Group by Sprint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SprintGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SprintGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SprintGroupByArgs['orderBy'] }
        : { orderBy?: SprintGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SprintGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSprintGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sprint model
   */
  readonly fields: SprintFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sprint.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SprintClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tasks<T extends Sprint$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Sprint$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sprint model
   */ 
  interface SprintFieldRefs {
    readonly id: FieldRef<"Sprint", 'String'>
    readonly boardId: FieldRef<"Sprint", 'String'>
    readonly name: FieldRef<"Sprint", 'String'>
    readonly goal: FieldRef<"Sprint", 'String'>
    readonly startDate: FieldRef<"Sprint", 'DateTime'>
    readonly endDate: FieldRef<"Sprint", 'DateTime'>
    readonly status: FieldRef<"Sprint", 'SprintStatus'>
    readonly committedPoints: FieldRef<"Sprint", 'Int'>
    readonly completedPoints: FieldRef<"Sprint", 'Int'>
    readonly startedAt: FieldRef<"Sprint", 'DateTime'>
    readonly completedAt: FieldRef<"Sprint", 'DateTime'>
    readonly createdAt: FieldRef<"Sprint", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Sprint findUnique
   */
  export type SprintFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter, which Sprint to fetch.
     */
    where: SprintWhereUniqueInput
  }

  /**
   * Sprint findUniqueOrThrow
   */
  export type SprintFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter, which Sprint to fetch.
     */
    where: SprintWhereUniqueInput
  }

  /**
   * Sprint findFirst
   */
  export type SprintFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter, which Sprint to fetch.
     */
    where?: SprintWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sprints to fetch.
     */
    orderBy?: SprintOrderByWithRelationInput | SprintOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sprints.
     */
    cursor?: SprintWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sprints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sprints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sprints.
     */
    distinct?: SprintScalarFieldEnum | SprintScalarFieldEnum[]
  }

  /**
   * Sprint findFirstOrThrow
   */
  export type SprintFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter, which Sprint to fetch.
     */
    where?: SprintWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sprints to fetch.
     */
    orderBy?: SprintOrderByWithRelationInput | SprintOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sprints.
     */
    cursor?: SprintWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sprints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sprints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sprints.
     */
    distinct?: SprintScalarFieldEnum | SprintScalarFieldEnum[]
  }

  /**
   * Sprint findMany
   */
  export type SprintFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter, which Sprints to fetch.
     */
    where?: SprintWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sprints to fetch.
     */
    orderBy?: SprintOrderByWithRelationInput | SprintOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sprints.
     */
    cursor?: SprintWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sprints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sprints.
     */
    skip?: number
    distinct?: SprintScalarFieldEnum | SprintScalarFieldEnum[]
  }

  /**
   * Sprint create
   */
  export type SprintCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * The data needed to create a Sprint.
     */
    data: XOR<SprintCreateInput, SprintUncheckedCreateInput>
  }

  /**
   * Sprint createMany
   */
  export type SprintCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sprints.
     */
    data: SprintCreateManyInput | SprintCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sprint createManyAndReturn
   */
  export type SprintCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Sprints.
     */
    data: SprintCreateManyInput | SprintCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Sprint update
   */
  export type SprintUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * The data needed to update a Sprint.
     */
    data: XOR<SprintUpdateInput, SprintUncheckedUpdateInput>
    /**
     * Choose, which Sprint to update.
     */
    where: SprintWhereUniqueInput
  }

  /**
   * Sprint updateMany
   */
  export type SprintUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sprints.
     */
    data: XOR<SprintUpdateManyMutationInput, SprintUncheckedUpdateManyInput>
    /**
     * Filter which Sprints to update
     */
    where?: SprintWhereInput
  }

  /**
   * Sprint upsert
   */
  export type SprintUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * The filter to search for the Sprint to update in case it exists.
     */
    where: SprintWhereUniqueInput
    /**
     * In case the Sprint found by the `where` argument doesn't exist, create a new Sprint with this data.
     */
    create: XOR<SprintCreateInput, SprintUncheckedCreateInput>
    /**
     * In case the Sprint was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SprintUpdateInput, SprintUncheckedUpdateInput>
  }

  /**
   * Sprint delete
   */
  export type SprintDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
    /**
     * Filter which Sprint to delete.
     */
    where: SprintWhereUniqueInput
  }

  /**
   * Sprint deleteMany
   */
  export type SprintDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sprints to delete
     */
    where?: SprintWhereInput
  }

  /**
   * Sprint.tasks
   */
  export type Sprint$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Sprint without action
   */
  export type SprintDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sprint
     */
    select?: SprintSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SprintInclude<ExtArgs> | null
  }


  /**
   * Model Epic
   */

  export type AggregateEpic = {
    _count: EpicCountAggregateOutputType | null
    _min: EpicMinAggregateOutputType | null
    _max: EpicMaxAggregateOutputType | null
  }

  export type EpicMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    description: string | null
    color: string | null
    createdAt: Date | null
  }

  export type EpicMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    description: string | null
    color: string | null
    createdAt: Date | null
  }

  export type EpicCountAggregateOutputType = {
    id: number
    boardId: number
    name: number
    description: number
    color: number
    createdAt: number
    _all: number
  }


  export type EpicMinAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    description?: true
    color?: true
    createdAt?: true
  }

  export type EpicMaxAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    description?: true
    color?: true
    createdAt?: true
  }

  export type EpicCountAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    description?: true
    color?: true
    createdAt?: true
    _all?: true
  }

  export type EpicAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Epic to aggregate.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Epics
    **/
    _count?: true | EpicCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EpicMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EpicMaxAggregateInputType
  }

  export type GetEpicAggregateType<T extends EpicAggregateArgs> = {
        [P in keyof T & keyof AggregateEpic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEpic[P]>
      : GetScalarType<T[P], AggregateEpic[P]>
  }




  export type EpicGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpicWhereInput
    orderBy?: EpicOrderByWithAggregationInput | EpicOrderByWithAggregationInput[]
    by: EpicScalarFieldEnum[] | EpicScalarFieldEnum
    having?: EpicScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EpicCountAggregateInputType | true
    _min?: EpicMinAggregateInputType
    _max?: EpicMaxAggregateInputType
  }

  export type EpicGroupByOutputType = {
    id: string
    boardId: string
    name: string
    description: string | null
    color: string
    createdAt: Date
    _count: EpicCountAggregateOutputType | null
    _min: EpicMinAggregateOutputType | null
    _max: EpicMaxAggregateOutputType | null
  }

  type GetEpicGroupByPayload<T extends EpicGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EpicGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EpicGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EpicGroupByOutputType[P]>
            : GetScalarType<T[P], EpicGroupByOutputType[P]>
        }
      >
    >


  export type EpicSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Epic$tasksArgs<ExtArgs>
    _count?: boolean | EpicCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["epic"]>

  export type EpicSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["epic"]>

  export type EpicSelectScalar = {
    id?: boolean
    boardId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    createdAt?: boolean
  }

  export type EpicInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Epic$tasksArgs<ExtArgs>
    _count?: boolean | EpicCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EpicIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }

  export type $EpicPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Epic"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
      tasks: Prisma.$TaskPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      name: string
      description: string | null
      color: string
      createdAt: Date
    }, ExtArgs["result"]["epic"]>
    composites: {}
  }

  type EpicGetPayload<S extends boolean | null | undefined | EpicDefaultArgs> = $Result.GetResult<Prisma.$EpicPayload, S>

  type EpicCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EpicFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EpicCountAggregateInputType | true
    }

  export interface EpicDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Epic'], meta: { name: 'Epic' } }
    /**
     * Find zero or one Epic that matches the filter.
     * @param {EpicFindUniqueArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EpicFindUniqueArgs>(args: SelectSubset<T, EpicFindUniqueArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Epic that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EpicFindUniqueOrThrowArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EpicFindUniqueOrThrowArgs>(args: SelectSubset<T, EpicFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Epic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindFirstArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EpicFindFirstArgs>(args?: SelectSubset<T, EpicFindFirstArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Epic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindFirstOrThrowArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EpicFindFirstOrThrowArgs>(args?: SelectSubset<T, EpicFindFirstOrThrowArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Epics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Epics
     * const epics = await prisma.epic.findMany()
     * 
     * // Get first 10 Epics
     * const epics = await prisma.epic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const epicWithIdOnly = await prisma.epic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EpicFindManyArgs>(args?: SelectSubset<T, EpicFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Epic.
     * @param {EpicCreateArgs} args - Arguments to create a Epic.
     * @example
     * // Create one Epic
     * const Epic = await prisma.epic.create({
     *   data: {
     *     // ... data to create a Epic
     *   }
     * })
     * 
     */
    create<T extends EpicCreateArgs>(args: SelectSubset<T, EpicCreateArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Epics.
     * @param {EpicCreateManyArgs} args - Arguments to create many Epics.
     * @example
     * // Create many Epics
     * const epic = await prisma.epic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EpicCreateManyArgs>(args?: SelectSubset<T, EpicCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Epics and returns the data saved in the database.
     * @param {EpicCreateManyAndReturnArgs} args - Arguments to create many Epics.
     * @example
     * // Create many Epics
     * const epic = await prisma.epic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Epics and only return the `id`
     * const epicWithIdOnly = await prisma.epic.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EpicCreateManyAndReturnArgs>(args?: SelectSubset<T, EpicCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Epic.
     * @param {EpicDeleteArgs} args - Arguments to delete one Epic.
     * @example
     * // Delete one Epic
     * const Epic = await prisma.epic.delete({
     *   where: {
     *     // ... filter to delete one Epic
     *   }
     * })
     * 
     */
    delete<T extends EpicDeleteArgs>(args: SelectSubset<T, EpicDeleteArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Epic.
     * @param {EpicUpdateArgs} args - Arguments to update one Epic.
     * @example
     * // Update one Epic
     * const epic = await prisma.epic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EpicUpdateArgs>(args: SelectSubset<T, EpicUpdateArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Epics.
     * @param {EpicDeleteManyArgs} args - Arguments to filter Epics to delete.
     * @example
     * // Delete a few Epics
     * const { count } = await prisma.epic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EpicDeleteManyArgs>(args?: SelectSubset<T, EpicDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Epics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Epics
     * const epic = await prisma.epic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EpicUpdateManyArgs>(args: SelectSubset<T, EpicUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Epic.
     * @param {EpicUpsertArgs} args - Arguments to update or create a Epic.
     * @example
     * // Update or create a Epic
     * const epic = await prisma.epic.upsert({
     *   create: {
     *     // ... data to create a Epic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Epic we want to update
     *   }
     * })
     */
    upsert<T extends EpicUpsertArgs>(args: SelectSubset<T, EpicUpsertArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Epics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicCountArgs} args - Arguments to filter Epics to count.
     * @example
     * // Count the number of Epics
     * const count = await prisma.epic.count({
     *   where: {
     *     // ... the filter for the Epics we want to count
     *   }
     * })
    **/
    count<T extends EpicCountArgs>(
      args?: Subset<T, EpicCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EpicCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Epic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EpicAggregateArgs>(args: Subset<T, EpicAggregateArgs>): Prisma.PrismaPromise<GetEpicAggregateType<T>>

    /**
     * Group by Epic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EpicGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EpicGroupByArgs['orderBy'] }
        : { orderBy?: EpicGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EpicGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEpicGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Epic model
   */
  readonly fields: EpicFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Epic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EpicClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tasks<T extends Epic$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Epic$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Epic model
   */ 
  interface EpicFieldRefs {
    readonly id: FieldRef<"Epic", 'String'>
    readonly boardId: FieldRef<"Epic", 'String'>
    readonly name: FieldRef<"Epic", 'String'>
    readonly description: FieldRef<"Epic", 'String'>
    readonly color: FieldRef<"Epic", 'String'>
    readonly createdAt: FieldRef<"Epic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Epic findUnique
   */
  export type EpicFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic findUniqueOrThrow
   */
  export type EpicFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic findFirst
   */
  export type EpicFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Epics.
     */
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic findFirstOrThrow
   */
  export type EpicFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Epics.
     */
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic findMany
   */
  export type EpicFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epics to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic create
   */
  export type EpicCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The data needed to create a Epic.
     */
    data: XOR<EpicCreateInput, EpicUncheckedCreateInput>
  }

  /**
   * Epic createMany
   */
  export type EpicCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Epics.
     */
    data: EpicCreateManyInput | EpicCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Epic createManyAndReturn
   */
  export type EpicCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Epics.
     */
    data: EpicCreateManyInput | EpicCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Epic update
   */
  export type EpicUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The data needed to update a Epic.
     */
    data: XOR<EpicUpdateInput, EpicUncheckedUpdateInput>
    /**
     * Choose, which Epic to update.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic updateMany
   */
  export type EpicUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Epics.
     */
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyInput>
    /**
     * Filter which Epics to update
     */
    where?: EpicWhereInput
  }

  /**
   * Epic upsert
   */
  export type EpicUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The filter to search for the Epic to update in case it exists.
     */
    where: EpicWhereUniqueInput
    /**
     * In case the Epic found by the `where` argument doesn't exist, create a new Epic with this data.
     */
    create: XOR<EpicCreateInput, EpicUncheckedCreateInput>
    /**
     * In case the Epic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EpicUpdateInput, EpicUncheckedUpdateInput>
  }

  /**
   * Epic delete
   */
  export type EpicDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter which Epic to delete.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic deleteMany
   */
  export type EpicDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Epics to delete
     */
    where?: EpicWhereInput
  }

  /**
   * Epic.tasks
   */
  export type Epic$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Task
     */
    select?: TaskSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskInclude<ExtArgs> | null
    where?: TaskWhereInput
    orderBy?: TaskOrderByWithRelationInput | TaskOrderByWithRelationInput[]
    cursor?: TaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskScalarFieldEnum | TaskScalarFieldEnum[]
  }

  /**
   * Epic without action
   */
  export type EpicDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
  }


  /**
   * Model Label
   */

  export type AggregateLabel = {
    _count: LabelCountAggregateOutputType | null
    _min: LabelMinAggregateOutputType | null
    _max: LabelMaxAggregateOutputType | null
  }

  export type LabelMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    color: string | null
    createdAt: Date | null
  }

  export type LabelMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    name: string | null
    color: string | null
    createdAt: Date | null
  }

  export type LabelCountAggregateOutputType = {
    id: number
    boardId: number
    name: number
    color: number
    createdAt: number
    _all: number
  }


  export type LabelMinAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    createdAt?: true
  }

  export type LabelMaxAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    createdAt?: true
  }

  export type LabelCountAggregateInputType = {
    id?: true
    boardId?: true
    name?: true
    color?: true
    createdAt?: true
    _all?: true
  }

  export type LabelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Label to aggregate.
     */
    where?: LabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Labels to fetch.
     */
    orderBy?: LabelOrderByWithRelationInput | LabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Labels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Labels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Labels
    **/
    _count?: true | LabelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LabelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LabelMaxAggregateInputType
  }

  export type GetLabelAggregateType<T extends LabelAggregateArgs> = {
        [P in keyof T & keyof AggregateLabel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLabel[P]>
      : GetScalarType<T[P], AggregateLabel[P]>
  }




  export type LabelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LabelWhereInput
    orderBy?: LabelOrderByWithAggregationInput | LabelOrderByWithAggregationInput[]
    by: LabelScalarFieldEnum[] | LabelScalarFieldEnum
    having?: LabelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LabelCountAggregateInputType | true
    _min?: LabelMinAggregateInputType
    _max?: LabelMaxAggregateInputType
  }

  export type LabelGroupByOutputType = {
    id: string
    boardId: string
    name: string
    color: string
    createdAt: Date
    _count: LabelCountAggregateOutputType | null
    _min: LabelMinAggregateOutputType | null
    _max: LabelMaxAggregateOutputType | null
  }

  type GetLabelGroupByPayload<T extends LabelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LabelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LabelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LabelGroupByOutputType[P]>
            : GetScalarType<T[P], LabelGroupByOutputType[P]>
        }
      >
    >


  export type LabelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Label$tasksArgs<ExtArgs>
    _count?: boolean | LabelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["label"]>

  export type LabelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["label"]>

  export type LabelSelectScalar = {
    id?: boolean
    boardId?: boolean
    name?: boolean
    color?: boolean
    createdAt?: boolean
  }

  export type LabelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
    tasks?: boolean | Label$tasksArgs<ExtArgs>
    _count?: boolean | LabelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LabelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }

  export type $LabelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Label"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
      tasks: Prisma.$TaskLabelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      name: string
      color: string
      createdAt: Date
    }, ExtArgs["result"]["label"]>
    composites: {}
  }

  type LabelGetPayload<S extends boolean | null | undefined | LabelDefaultArgs> = $Result.GetResult<Prisma.$LabelPayload, S>

  type LabelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LabelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LabelCountAggregateInputType | true
    }

  export interface LabelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Label'], meta: { name: 'Label' } }
    /**
     * Find zero or one Label that matches the filter.
     * @param {LabelFindUniqueArgs} args - Arguments to find a Label
     * @example
     * // Get one Label
     * const label = await prisma.label.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LabelFindUniqueArgs>(args: SelectSubset<T, LabelFindUniqueArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Label that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LabelFindUniqueOrThrowArgs} args - Arguments to find a Label
     * @example
     * // Get one Label
     * const label = await prisma.label.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LabelFindUniqueOrThrowArgs>(args: SelectSubset<T, LabelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Label that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelFindFirstArgs} args - Arguments to find a Label
     * @example
     * // Get one Label
     * const label = await prisma.label.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LabelFindFirstArgs>(args?: SelectSubset<T, LabelFindFirstArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Label that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelFindFirstOrThrowArgs} args - Arguments to find a Label
     * @example
     * // Get one Label
     * const label = await prisma.label.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LabelFindFirstOrThrowArgs>(args?: SelectSubset<T, LabelFindFirstOrThrowArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Labels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Labels
     * const labels = await prisma.label.findMany()
     * 
     * // Get first 10 Labels
     * const labels = await prisma.label.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const labelWithIdOnly = await prisma.label.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LabelFindManyArgs>(args?: SelectSubset<T, LabelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Label.
     * @param {LabelCreateArgs} args - Arguments to create a Label.
     * @example
     * // Create one Label
     * const Label = await prisma.label.create({
     *   data: {
     *     // ... data to create a Label
     *   }
     * })
     * 
     */
    create<T extends LabelCreateArgs>(args: SelectSubset<T, LabelCreateArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Labels.
     * @param {LabelCreateManyArgs} args - Arguments to create many Labels.
     * @example
     * // Create many Labels
     * const label = await prisma.label.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LabelCreateManyArgs>(args?: SelectSubset<T, LabelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Labels and returns the data saved in the database.
     * @param {LabelCreateManyAndReturnArgs} args - Arguments to create many Labels.
     * @example
     * // Create many Labels
     * const label = await prisma.label.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Labels and only return the `id`
     * const labelWithIdOnly = await prisma.label.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LabelCreateManyAndReturnArgs>(args?: SelectSubset<T, LabelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Label.
     * @param {LabelDeleteArgs} args - Arguments to delete one Label.
     * @example
     * // Delete one Label
     * const Label = await prisma.label.delete({
     *   where: {
     *     // ... filter to delete one Label
     *   }
     * })
     * 
     */
    delete<T extends LabelDeleteArgs>(args: SelectSubset<T, LabelDeleteArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Label.
     * @param {LabelUpdateArgs} args - Arguments to update one Label.
     * @example
     * // Update one Label
     * const label = await prisma.label.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LabelUpdateArgs>(args: SelectSubset<T, LabelUpdateArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Labels.
     * @param {LabelDeleteManyArgs} args - Arguments to filter Labels to delete.
     * @example
     * // Delete a few Labels
     * const { count } = await prisma.label.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LabelDeleteManyArgs>(args?: SelectSubset<T, LabelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Labels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Labels
     * const label = await prisma.label.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LabelUpdateManyArgs>(args: SelectSubset<T, LabelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Label.
     * @param {LabelUpsertArgs} args - Arguments to update or create a Label.
     * @example
     * // Update or create a Label
     * const label = await prisma.label.upsert({
     *   create: {
     *     // ... data to create a Label
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Label we want to update
     *   }
     * })
     */
    upsert<T extends LabelUpsertArgs>(args: SelectSubset<T, LabelUpsertArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Labels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelCountArgs} args - Arguments to filter Labels to count.
     * @example
     * // Count the number of Labels
     * const count = await prisma.label.count({
     *   where: {
     *     // ... the filter for the Labels we want to count
     *   }
     * })
    **/
    count<T extends LabelCountArgs>(
      args?: Subset<T, LabelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LabelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Label.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LabelAggregateArgs>(args: Subset<T, LabelAggregateArgs>): Prisma.PrismaPromise<GetLabelAggregateType<T>>

    /**
     * Group by Label.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LabelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LabelGroupByArgs['orderBy'] }
        : { orderBy?: LabelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LabelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLabelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Label model
   */
  readonly fields: LabelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Label.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LabelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tasks<T extends Label$tasksArgs<ExtArgs> = {}>(args?: Subset<T, Label$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Label model
   */ 
  interface LabelFieldRefs {
    readonly id: FieldRef<"Label", 'String'>
    readonly boardId: FieldRef<"Label", 'String'>
    readonly name: FieldRef<"Label", 'String'>
    readonly color: FieldRef<"Label", 'String'>
    readonly createdAt: FieldRef<"Label", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Label findUnique
   */
  export type LabelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter, which Label to fetch.
     */
    where: LabelWhereUniqueInput
  }

  /**
   * Label findUniqueOrThrow
   */
  export type LabelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter, which Label to fetch.
     */
    where: LabelWhereUniqueInput
  }

  /**
   * Label findFirst
   */
  export type LabelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter, which Label to fetch.
     */
    where?: LabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Labels to fetch.
     */
    orderBy?: LabelOrderByWithRelationInput | LabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Labels.
     */
    cursor?: LabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Labels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Labels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Labels.
     */
    distinct?: LabelScalarFieldEnum | LabelScalarFieldEnum[]
  }

  /**
   * Label findFirstOrThrow
   */
  export type LabelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter, which Label to fetch.
     */
    where?: LabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Labels to fetch.
     */
    orderBy?: LabelOrderByWithRelationInput | LabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Labels.
     */
    cursor?: LabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Labels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Labels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Labels.
     */
    distinct?: LabelScalarFieldEnum | LabelScalarFieldEnum[]
  }

  /**
   * Label findMany
   */
  export type LabelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter, which Labels to fetch.
     */
    where?: LabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Labels to fetch.
     */
    orderBy?: LabelOrderByWithRelationInput | LabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Labels.
     */
    cursor?: LabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Labels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Labels.
     */
    skip?: number
    distinct?: LabelScalarFieldEnum | LabelScalarFieldEnum[]
  }

  /**
   * Label create
   */
  export type LabelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * The data needed to create a Label.
     */
    data: XOR<LabelCreateInput, LabelUncheckedCreateInput>
  }

  /**
   * Label createMany
   */
  export type LabelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Labels.
     */
    data: LabelCreateManyInput | LabelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Label createManyAndReturn
   */
  export type LabelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Labels.
     */
    data: LabelCreateManyInput | LabelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Label update
   */
  export type LabelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * The data needed to update a Label.
     */
    data: XOR<LabelUpdateInput, LabelUncheckedUpdateInput>
    /**
     * Choose, which Label to update.
     */
    where: LabelWhereUniqueInput
  }

  /**
   * Label updateMany
   */
  export type LabelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Labels.
     */
    data: XOR<LabelUpdateManyMutationInput, LabelUncheckedUpdateManyInput>
    /**
     * Filter which Labels to update
     */
    where?: LabelWhereInput
  }

  /**
   * Label upsert
   */
  export type LabelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * The filter to search for the Label to update in case it exists.
     */
    where: LabelWhereUniqueInput
    /**
     * In case the Label found by the `where` argument doesn't exist, create a new Label with this data.
     */
    create: XOR<LabelCreateInput, LabelUncheckedCreateInput>
    /**
     * In case the Label was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LabelUpdateInput, LabelUncheckedUpdateInput>
  }

  /**
   * Label delete
   */
  export type LabelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
    /**
     * Filter which Label to delete.
     */
    where: LabelWhereUniqueInput
  }

  /**
   * Label deleteMany
   */
  export type LabelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Labels to delete
     */
    where?: LabelWhereInput
  }

  /**
   * Label.tasks
   */
  export type Label$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    where?: TaskLabelWhereInput
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    cursor?: TaskLabelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TaskLabelScalarFieldEnum | TaskLabelScalarFieldEnum[]
  }

  /**
   * Label without action
   */
  export type LabelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Label
     */
    select?: LabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LabelInclude<ExtArgs> | null
  }


  /**
   * Model TaskLabel
   */

  export type AggregateTaskLabel = {
    _count: TaskLabelCountAggregateOutputType | null
    _min: TaskLabelMinAggregateOutputType | null
    _max: TaskLabelMaxAggregateOutputType | null
  }

  export type TaskLabelMinAggregateOutputType = {
    taskId: string | null
    labelId: string | null
  }

  export type TaskLabelMaxAggregateOutputType = {
    taskId: string | null
    labelId: string | null
  }

  export type TaskLabelCountAggregateOutputType = {
    taskId: number
    labelId: number
    _all: number
  }


  export type TaskLabelMinAggregateInputType = {
    taskId?: true
    labelId?: true
  }

  export type TaskLabelMaxAggregateInputType = {
    taskId?: true
    labelId?: true
  }

  export type TaskLabelCountAggregateInputType = {
    taskId?: true
    labelId?: true
    _all?: true
  }

  export type TaskLabelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaskLabel to aggregate.
     */
    where?: TaskLabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskLabels to fetch.
     */
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskLabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskLabels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskLabels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TaskLabels
    **/
    _count?: true | TaskLabelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskLabelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskLabelMaxAggregateInputType
  }

  export type GetTaskLabelAggregateType<T extends TaskLabelAggregateArgs> = {
        [P in keyof T & keyof AggregateTaskLabel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTaskLabel[P]>
      : GetScalarType<T[P], AggregateTaskLabel[P]>
  }




  export type TaskLabelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskLabelWhereInput
    orderBy?: TaskLabelOrderByWithAggregationInput | TaskLabelOrderByWithAggregationInput[]
    by: TaskLabelScalarFieldEnum[] | TaskLabelScalarFieldEnum
    having?: TaskLabelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskLabelCountAggregateInputType | true
    _min?: TaskLabelMinAggregateInputType
    _max?: TaskLabelMaxAggregateInputType
  }

  export type TaskLabelGroupByOutputType = {
    taskId: string
    labelId: string
    _count: TaskLabelCountAggregateOutputType | null
    _min: TaskLabelMinAggregateOutputType | null
    _max: TaskLabelMaxAggregateOutputType | null
  }

  type GetTaskLabelGroupByPayload<T extends TaskLabelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaskLabelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskLabelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskLabelGroupByOutputType[P]>
            : GetScalarType<T[P], TaskLabelGroupByOutputType[P]>
        }
      >
    >


  export type TaskLabelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    taskId?: boolean
    labelId?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
    label?: boolean | LabelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["taskLabel"]>

  export type TaskLabelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    taskId?: boolean
    labelId?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
    label?: boolean | LabelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["taskLabel"]>

  export type TaskLabelSelectScalar = {
    taskId?: boolean
    labelId?: boolean
  }

  export type TaskLabelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
    label?: boolean | LabelDefaultArgs<ExtArgs>
  }
  export type TaskLabelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
    label?: boolean | LabelDefaultArgs<ExtArgs>
  }

  export type $TaskLabelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TaskLabel"
    objects: {
      task: Prisma.$TaskPayload<ExtArgs>
      label: Prisma.$LabelPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      taskId: string
      labelId: string
    }, ExtArgs["result"]["taskLabel"]>
    composites: {}
  }

  type TaskLabelGetPayload<S extends boolean | null | undefined | TaskLabelDefaultArgs> = $Result.GetResult<Prisma.$TaskLabelPayload, S>

  type TaskLabelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TaskLabelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TaskLabelCountAggregateInputType | true
    }

  export interface TaskLabelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TaskLabel'], meta: { name: 'TaskLabel' } }
    /**
     * Find zero or one TaskLabel that matches the filter.
     * @param {TaskLabelFindUniqueArgs} args - Arguments to find a TaskLabel
     * @example
     * // Get one TaskLabel
     * const taskLabel = await prisma.taskLabel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaskLabelFindUniqueArgs>(args: SelectSubset<T, TaskLabelFindUniqueArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TaskLabel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TaskLabelFindUniqueOrThrowArgs} args - Arguments to find a TaskLabel
     * @example
     * // Get one TaskLabel
     * const taskLabel = await prisma.taskLabel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaskLabelFindUniqueOrThrowArgs>(args: SelectSubset<T, TaskLabelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TaskLabel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelFindFirstArgs} args - Arguments to find a TaskLabel
     * @example
     * // Get one TaskLabel
     * const taskLabel = await prisma.taskLabel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaskLabelFindFirstArgs>(args?: SelectSubset<T, TaskLabelFindFirstArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TaskLabel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelFindFirstOrThrowArgs} args - Arguments to find a TaskLabel
     * @example
     * // Get one TaskLabel
     * const taskLabel = await prisma.taskLabel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaskLabelFindFirstOrThrowArgs>(args?: SelectSubset<T, TaskLabelFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TaskLabels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TaskLabels
     * const taskLabels = await prisma.taskLabel.findMany()
     * 
     * // Get first 10 TaskLabels
     * const taskLabels = await prisma.taskLabel.findMany({ take: 10 })
     * 
     * // Only select the `taskId`
     * const taskLabelWithTaskIdOnly = await prisma.taskLabel.findMany({ select: { taskId: true } })
     * 
     */
    findMany<T extends TaskLabelFindManyArgs>(args?: SelectSubset<T, TaskLabelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TaskLabel.
     * @param {TaskLabelCreateArgs} args - Arguments to create a TaskLabel.
     * @example
     * // Create one TaskLabel
     * const TaskLabel = await prisma.taskLabel.create({
     *   data: {
     *     // ... data to create a TaskLabel
     *   }
     * })
     * 
     */
    create<T extends TaskLabelCreateArgs>(args: SelectSubset<T, TaskLabelCreateArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TaskLabels.
     * @param {TaskLabelCreateManyArgs} args - Arguments to create many TaskLabels.
     * @example
     * // Create many TaskLabels
     * const taskLabel = await prisma.taskLabel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaskLabelCreateManyArgs>(args?: SelectSubset<T, TaskLabelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TaskLabels and returns the data saved in the database.
     * @param {TaskLabelCreateManyAndReturnArgs} args - Arguments to create many TaskLabels.
     * @example
     * // Create many TaskLabels
     * const taskLabel = await prisma.taskLabel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TaskLabels and only return the `taskId`
     * const taskLabelWithTaskIdOnly = await prisma.taskLabel.createManyAndReturn({ 
     *   select: { taskId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaskLabelCreateManyAndReturnArgs>(args?: SelectSubset<T, TaskLabelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TaskLabel.
     * @param {TaskLabelDeleteArgs} args - Arguments to delete one TaskLabel.
     * @example
     * // Delete one TaskLabel
     * const TaskLabel = await prisma.taskLabel.delete({
     *   where: {
     *     // ... filter to delete one TaskLabel
     *   }
     * })
     * 
     */
    delete<T extends TaskLabelDeleteArgs>(args: SelectSubset<T, TaskLabelDeleteArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TaskLabel.
     * @param {TaskLabelUpdateArgs} args - Arguments to update one TaskLabel.
     * @example
     * // Update one TaskLabel
     * const taskLabel = await prisma.taskLabel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaskLabelUpdateArgs>(args: SelectSubset<T, TaskLabelUpdateArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TaskLabels.
     * @param {TaskLabelDeleteManyArgs} args - Arguments to filter TaskLabels to delete.
     * @example
     * // Delete a few TaskLabels
     * const { count } = await prisma.taskLabel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaskLabelDeleteManyArgs>(args?: SelectSubset<T, TaskLabelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TaskLabels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TaskLabels
     * const taskLabel = await prisma.taskLabel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaskLabelUpdateManyArgs>(args: SelectSubset<T, TaskLabelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TaskLabel.
     * @param {TaskLabelUpsertArgs} args - Arguments to update or create a TaskLabel.
     * @example
     * // Update or create a TaskLabel
     * const taskLabel = await prisma.taskLabel.upsert({
     *   create: {
     *     // ... data to create a TaskLabel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TaskLabel we want to update
     *   }
     * })
     */
    upsert<T extends TaskLabelUpsertArgs>(args: SelectSubset<T, TaskLabelUpsertArgs<ExtArgs>>): Prisma__TaskLabelClient<$Result.GetResult<Prisma.$TaskLabelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TaskLabels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelCountArgs} args - Arguments to filter TaskLabels to count.
     * @example
     * // Count the number of TaskLabels
     * const count = await prisma.taskLabel.count({
     *   where: {
     *     // ... the filter for the TaskLabels we want to count
     *   }
     * })
    **/
    count<T extends TaskLabelCountArgs>(
      args?: Subset<T, TaskLabelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskLabelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TaskLabel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaskLabelAggregateArgs>(args: Subset<T, TaskLabelAggregateArgs>): Prisma.PrismaPromise<GetTaskLabelAggregateType<T>>

    /**
     * Group by TaskLabel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskLabelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaskLabelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskLabelGroupByArgs['orderBy'] }
        : { orderBy?: TaskLabelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaskLabelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskLabelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TaskLabel model
   */
  readonly fields: TaskLabelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TaskLabel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaskLabelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    task<T extends TaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TaskDefaultArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    label<T extends LabelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LabelDefaultArgs<ExtArgs>>): Prisma__LabelClient<$Result.GetResult<Prisma.$LabelPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TaskLabel model
   */ 
  interface TaskLabelFieldRefs {
    readonly taskId: FieldRef<"TaskLabel", 'String'>
    readonly labelId: FieldRef<"TaskLabel", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TaskLabel findUnique
   */
  export type TaskLabelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter, which TaskLabel to fetch.
     */
    where: TaskLabelWhereUniqueInput
  }

  /**
   * TaskLabel findUniqueOrThrow
   */
  export type TaskLabelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter, which TaskLabel to fetch.
     */
    where: TaskLabelWhereUniqueInput
  }

  /**
   * TaskLabel findFirst
   */
  export type TaskLabelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter, which TaskLabel to fetch.
     */
    where?: TaskLabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskLabels to fetch.
     */
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaskLabels.
     */
    cursor?: TaskLabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskLabels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskLabels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaskLabels.
     */
    distinct?: TaskLabelScalarFieldEnum | TaskLabelScalarFieldEnum[]
  }

  /**
   * TaskLabel findFirstOrThrow
   */
  export type TaskLabelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter, which TaskLabel to fetch.
     */
    where?: TaskLabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskLabels to fetch.
     */
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaskLabels.
     */
    cursor?: TaskLabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskLabels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskLabels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaskLabels.
     */
    distinct?: TaskLabelScalarFieldEnum | TaskLabelScalarFieldEnum[]
  }

  /**
   * TaskLabel findMany
   */
  export type TaskLabelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter, which TaskLabels to fetch.
     */
    where?: TaskLabelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskLabels to fetch.
     */
    orderBy?: TaskLabelOrderByWithRelationInput | TaskLabelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TaskLabels.
     */
    cursor?: TaskLabelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskLabels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskLabels.
     */
    skip?: number
    distinct?: TaskLabelScalarFieldEnum | TaskLabelScalarFieldEnum[]
  }

  /**
   * TaskLabel create
   */
  export type TaskLabelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * The data needed to create a TaskLabel.
     */
    data: XOR<TaskLabelCreateInput, TaskLabelUncheckedCreateInput>
  }

  /**
   * TaskLabel createMany
   */
  export type TaskLabelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TaskLabels.
     */
    data: TaskLabelCreateManyInput | TaskLabelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TaskLabel createManyAndReturn
   */
  export type TaskLabelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TaskLabels.
     */
    data: TaskLabelCreateManyInput | TaskLabelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TaskLabel update
   */
  export type TaskLabelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * The data needed to update a TaskLabel.
     */
    data: XOR<TaskLabelUpdateInput, TaskLabelUncheckedUpdateInput>
    /**
     * Choose, which TaskLabel to update.
     */
    where: TaskLabelWhereUniqueInput
  }

  /**
   * TaskLabel updateMany
   */
  export type TaskLabelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TaskLabels.
     */
    data: XOR<TaskLabelUpdateManyMutationInput, TaskLabelUncheckedUpdateManyInput>
    /**
     * Filter which TaskLabels to update
     */
    where?: TaskLabelWhereInput
  }

  /**
   * TaskLabel upsert
   */
  export type TaskLabelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * The filter to search for the TaskLabel to update in case it exists.
     */
    where: TaskLabelWhereUniqueInput
    /**
     * In case the TaskLabel found by the `where` argument doesn't exist, create a new TaskLabel with this data.
     */
    create: XOR<TaskLabelCreateInput, TaskLabelUncheckedCreateInput>
    /**
     * In case the TaskLabel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskLabelUpdateInput, TaskLabelUncheckedUpdateInput>
  }

  /**
   * TaskLabel delete
   */
  export type TaskLabelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
    /**
     * Filter which TaskLabel to delete.
     */
    where: TaskLabelWhereUniqueInput
  }

  /**
   * TaskLabel deleteMany
   */
  export type TaskLabelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaskLabels to delete
     */
    where?: TaskLabelWhereInput
  }

  /**
   * TaskLabel without action
   */
  export type TaskLabelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskLabel
     */
    select?: TaskLabelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskLabelInclude<ExtArgs> | null
  }


  /**
   * Model Comment
   */

  export type AggregateComment = {
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  export type CommentMinAggregateOutputType = {
    id: string | null
    taskId: string | null
    userId: string | null
    content: string | null
    edited: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentMaxAggregateOutputType = {
    id: string | null
    taskId: string | null
    userId: string | null
    content: string | null
    edited: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CommentCountAggregateOutputType = {
    id: number
    taskId: number
    userId: number
    content: number
    mentions: number
    edited: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CommentMinAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    content?: true
    edited?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentMaxAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    content?: true
    edited?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CommentCountAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    content?: true
    mentions?: true
    edited?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comment to aggregate.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Comments
    **/
    _count?: true | CommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentMaxAggregateInputType
  }

  export type GetCommentAggregateType<T extends CommentAggregateArgs> = {
        [P in keyof T & keyof AggregateComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComment[P]>
      : GetScalarType<T[P], AggregateComment[P]>
  }




  export type CommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithAggregationInput | CommentOrderByWithAggregationInput[]
    by: CommentScalarFieldEnum[] | CommentScalarFieldEnum
    having?: CommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentCountAggregateInputType | true
    _min?: CommentMinAggregateInputType
    _max?: CommentMaxAggregateInputType
  }

  export type CommentGroupByOutputType = {
    id: string
    taskId: string
    userId: string
    content: string
    mentions: string[]
    edited: boolean
    createdAt: Date
    updatedAt: Date
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  type GetCommentGroupByPayload<T extends CommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentGroupByOutputType[P]>
            : GetScalarType<T[P], CommentGroupByOutputType[P]>
        }
      >
    >


  export type CommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    userId?: boolean
    content?: boolean
    mentions?: boolean
    edited?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    userId?: boolean
    content?: boolean
    mentions?: boolean
    edited?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectScalar = {
    id?: boolean
    taskId?: boolean
    userId?: boolean
    content?: boolean
    mentions?: boolean
    edited?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }
  export type CommentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }

  export type $CommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Comment"
    objects: {
      task: Prisma.$TaskPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      taskId: string
      userId: string
      content: string
      mentions: string[]
      edited: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["comment"]>
    composites: {}
  }

  type CommentGetPayload<S extends boolean | null | undefined | CommentDefaultArgs> = $Result.GetResult<Prisma.$CommentPayload, S>

  type CommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CommentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CommentCountAggregateInputType | true
    }

  export interface CommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Comment'], meta: { name: 'Comment' } }
    /**
     * Find zero or one Comment that matches the filter.
     * @param {CommentFindUniqueArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentFindUniqueArgs>(args: SelectSubset<T, CommentFindUniqueArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Comment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CommentFindUniqueOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Comment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentFindFirstArgs>(args?: SelectSubset<T, CommentFindFirstArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Comment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Comments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Comments
     * const comments = await prisma.comment.findMany()
     * 
     * // Get first 10 Comments
     * const comments = await prisma.comment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentWithIdOnly = await prisma.comment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentFindManyArgs>(args?: SelectSubset<T, CommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Comment.
     * @param {CommentCreateArgs} args - Arguments to create a Comment.
     * @example
     * // Create one Comment
     * const Comment = await prisma.comment.create({
     *   data: {
     *     // ... data to create a Comment
     *   }
     * })
     * 
     */
    create<T extends CommentCreateArgs>(args: SelectSubset<T, CommentCreateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Comments.
     * @param {CommentCreateManyArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentCreateManyArgs>(args?: SelectSubset<T, CommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Comments and returns the data saved in the database.
     * @param {CommentCreateManyAndReturnArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CommentCreateManyAndReturnArgs>(args?: SelectSubset<T, CommentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Comment.
     * @param {CommentDeleteArgs} args - Arguments to delete one Comment.
     * @example
     * // Delete one Comment
     * const Comment = await prisma.comment.delete({
     *   where: {
     *     // ... filter to delete one Comment
     *   }
     * })
     * 
     */
    delete<T extends CommentDeleteArgs>(args: SelectSubset<T, CommentDeleteArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Comment.
     * @param {CommentUpdateArgs} args - Arguments to update one Comment.
     * @example
     * // Update one Comment
     * const comment = await prisma.comment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentUpdateArgs>(args: SelectSubset<T, CommentUpdateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Comments.
     * @param {CommentDeleteManyArgs} args - Arguments to filter Comments to delete.
     * @example
     * // Delete a few Comments
     * const { count } = await prisma.comment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentDeleteManyArgs>(args?: SelectSubset<T, CommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentUpdateManyArgs>(args: SelectSubset<T, CommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Comment.
     * @param {CommentUpsertArgs} args - Arguments to update or create a Comment.
     * @example
     * // Update or create a Comment
     * const comment = await prisma.comment.upsert({
     *   create: {
     *     // ... data to create a Comment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Comment we want to update
     *   }
     * })
     */
    upsert<T extends CommentUpsertArgs>(args: SelectSubset<T, CommentUpsertArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentCountArgs} args - Arguments to filter Comments to count.
     * @example
     * // Count the number of Comments
     * const count = await prisma.comment.count({
     *   where: {
     *     // ... the filter for the Comments we want to count
     *   }
     * })
    **/
    count<T extends CommentCountArgs>(
      args?: Subset<T, CommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAggregateArgs>(args: Subset<T, CommentAggregateArgs>): Prisma.PrismaPromise<GetCommentAggregateType<T>>

    /**
     * Group by Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentGroupByArgs['orderBy'] }
        : { orderBy?: CommentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Comment model
   */
  readonly fields: CommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Comment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    task<T extends TaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TaskDefaultArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Comment model
   */ 
  interface CommentFieldRefs {
    readonly id: FieldRef<"Comment", 'String'>
    readonly taskId: FieldRef<"Comment", 'String'>
    readonly userId: FieldRef<"Comment", 'String'>
    readonly content: FieldRef<"Comment", 'String'>
    readonly mentions: FieldRef<"Comment", 'String[]'>
    readonly edited: FieldRef<"Comment", 'Boolean'>
    readonly createdAt: FieldRef<"Comment", 'DateTime'>
    readonly updatedAt: FieldRef<"Comment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Comment findUnique
   */
  export type CommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findUniqueOrThrow
   */
  export type CommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findFirst
   */
  export type CommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findFirstOrThrow
   */
  export type CommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findMany
   */
  export type CommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comments to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment create
   */
  export type CommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to create a Comment.
     */
    data: XOR<CommentCreateInput, CommentUncheckedCreateInput>
  }

  /**
   * Comment createMany
   */
  export type CommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Comment createManyAndReturn
   */
  export type CommentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment update
   */
  export type CommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to update a Comment.
     */
    data: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
    /**
     * Choose, which Comment to update.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment updateMany
   */
  export type CommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
  }

  /**
   * Comment upsert
   */
  export type CommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The filter to search for the Comment to update in case it exists.
     */
    where: CommentWhereUniqueInput
    /**
     * In case the Comment found by the `where` argument doesn't exist, create a new Comment with this data.
     */
    create: XOR<CommentCreateInput, CommentUncheckedCreateInput>
    /**
     * In case the Comment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
  }

  /**
   * Comment delete
   */
  export type CommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter which Comment to delete.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment deleteMany
   */
  export type CommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comments to delete
     */
    where?: CommentWhereInput
  }

  /**
   * Comment without action
   */
  export type CommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
  }


  /**
   * Model Attachment
   */

  export type AggregateAttachment = {
    _count: AttachmentCountAggregateOutputType | null
    _avg: AttachmentAvgAggregateOutputType | null
    _sum: AttachmentSumAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  export type AttachmentAvgAggregateOutputType = {
    size: number | null
  }

  export type AttachmentSumAggregateOutputType = {
    size: number | null
  }

  export type AttachmentMinAggregateOutputType = {
    id: string | null
    taskId: string | null
    fileId: string | null
    name: string | null
    mimeType: string | null
    size: number | null
    addedBy: string | null
    createdAt: Date | null
  }

  export type AttachmentMaxAggregateOutputType = {
    id: string | null
    taskId: string | null
    fileId: string | null
    name: string | null
    mimeType: string | null
    size: number | null
    addedBy: string | null
    createdAt: Date | null
  }

  export type AttachmentCountAggregateOutputType = {
    id: number
    taskId: number
    fileId: number
    name: number
    mimeType: number
    size: number
    addedBy: number
    createdAt: number
    _all: number
  }


  export type AttachmentAvgAggregateInputType = {
    size?: true
  }

  export type AttachmentSumAggregateInputType = {
    size?: true
  }

  export type AttachmentMinAggregateInputType = {
    id?: true
    taskId?: true
    fileId?: true
    name?: true
    mimeType?: true
    size?: true
    addedBy?: true
    createdAt?: true
  }

  export type AttachmentMaxAggregateInputType = {
    id?: true
    taskId?: true
    fileId?: true
    name?: true
    mimeType?: true
    size?: true
    addedBy?: true
    createdAt?: true
  }

  export type AttachmentCountAggregateInputType = {
    id?: true
    taskId?: true
    fileId?: true
    name?: true
    mimeType?: true
    size?: true
    addedBy?: true
    createdAt?: true
    _all?: true
  }

  export type AttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachment to aggregate.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attachments
    **/
    _count?: true | AttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttachmentMaxAggregateInputType
  }

  export type GetAttachmentAggregateType<T extends AttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttachment[P]>
      : GetScalarType<T[P], AggregateAttachment[P]>
  }




  export type AttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithAggregationInput | AttachmentOrderByWithAggregationInput[]
    by: AttachmentScalarFieldEnum[] | AttachmentScalarFieldEnum
    having?: AttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttachmentCountAggregateInputType | true
    _avg?: AttachmentAvgAggregateInputType
    _sum?: AttachmentSumAggregateInputType
    _min?: AttachmentMinAggregateInputType
    _max?: AttachmentMaxAggregateInputType
  }

  export type AttachmentGroupByOutputType = {
    id: string
    taskId: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt: Date
    _count: AttachmentCountAggregateOutputType | null
    _avg: AttachmentAvgAggregateOutputType | null
    _sum: AttachmentSumAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  type GetAttachmentGroupByPayload<T extends AttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
        }
      >
    >


  export type AttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    fileId?: boolean
    name?: boolean
    mimeType?: boolean
    size?: boolean
    addedBy?: boolean
    createdAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    fileId?: boolean
    name?: boolean
    mimeType?: boolean
    size?: boolean
    addedBy?: boolean
    createdAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectScalar = {
    id?: boolean
    taskId?: boolean
    fileId?: boolean
    name?: boolean
    mimeType?: boolean
    size?: boolean
    addedBy?: boolean
    createdAt?: boolean
  }

  export type AttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }
  export type AttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }

  export type $AttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attachment"
    objects: {
      task: Prisma.$TaskPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      taskId: string
      fileId: string
      name: string
      mimeType: string
      size: number
      addedBy: string
      createdAt: Date
    }, ExtArgs["result"]["attachment"]>
    composites: {}
  }

  type AttachmentGetPayload<S extends boolean | null | undefined | AttachmentDefaultArgs> = $Result.GetResult<Prisma.$AttachmentPayload, S>

  type AttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AttachmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AttachmentCountAggregateInputType | true
    }

  export interface AttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attachment'], meta: { name: 'Attachment' } }
    /**
     * Find zero or one Attachment that matches the filter.
     * @param {AttachmentFindUniqueArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttachmentFindUniqueArgs>(args: SelectSubset<T, AttachmentFindUniqueArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Attachment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AttachmentFindUniqueOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Attachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttachmentFindFirstArgs>(args?: SelectSubset<T, AttachmentFindFirstArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Attachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Attachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attachments
     * const attachments = await prisma.attachment.findMany()
     * 
     * // Get first 10 Attachments
     * const attachments = await prisma.attachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attachmentWithIdOnly = await prisma.attachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttachmentFindManyArgs>(args?: SelectSubset<T, AttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Attachment.
     * @param {AttachmentCreateArgs} args - Arguments to create a Attachment.
     * @example
     * // Create one Attachment
     * const Attachment = await prisma.attachment.create({
     *   data: {
     *     // ... data to create a Attachment
     *   }
     * })
     * 
     */
    create<T extends AttachmentCreateArgs>(args: SelectSubset<T, AttachmentCreateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Attachments.
     * @param {AttachmentCreateManyArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttachmentCreateManyArgs>(args?: SelectSubset<T, AttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attachments and returns the data saved in the database.
     * @param {AttachmentCreateManyAndReturnArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attachments and only return the `id`
     * const attachmentWithIdOnly = await prisma.attachment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Attachment.
     * @param {AttachmentDeleteArgs} args - Arguments to delete one Attachment.
     * @example
     * // Delete one Attachment
     * const Attachment = await prisma.attachment.delete({
     *   where: {
     *     // ... filter to delete one Attachment
     *   }
     * })
     * 
     */
    delete<T extends AttachmentDeleteArgs>(args: SelectSubset<T, AttachmentDeleteArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Attachment.
     * @param {AttachmentUpdateArgs} args - Arguments to update one Attachment.
     * @example
     * // Update one Attachment
     * const attachment = await prisma.attachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttachmentUpdateArgs>(args: SelectSubset<T, AttachmentUpdateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Attachments.
     * @param {AttachmentDeleteManyArgs} args - Arguments to filter Attachments to delete.
     * @example
     * // Delete a few Attachments
     * const { count } = await prisma.attachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttachmentDeleteManyArgs>(args?: SelectSubset<T, AttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attachments
     * const attachment = await prisma.attachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttachmentUpdateManyArgs>(args: SelectSubset<T, AttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Attachment.
     * @param {AttachmentUpsertArgs} args - Arguments to update or create a Attachment.
     * @example
     * // Update or create a Attachment
     * const attachment = await prisma.attachment.upsert({
     *   create: {
     *     // ... data to create a Attachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attachment we want to update
     *   }
     * })
     */
    upsert<T extends AttachmentUpsertArgs>(args: SelectSubset<T, AttachmentUpsertArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentCountArgs} args - Arguments to filter Attachments to count.
     * @example
     * // Count the number of Attachments
     * const count = await prisma.attachment.count({
     *   where: {
     *     // ... the filter for the Attachments we want to count
     *   }
     * })
    **/
    count<T extends AttachmentCountArgs>(
      args?: Subset<T, AttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttachmentAggregateArgs>(args: Subset<T, AttachmentAggregateArgs>): Prisma.PrismaPromise<GetAttachmentAggregateType<T>>

    /**
     * Group by Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttachmentGroupByArgs['orderBy'] }
        : { orderBy?: AttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attachment model
   */
  readonly fields: AttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    task<T extends TaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TaskDefaultArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attachment model
   */ 
  interface AttachmentFieldRefs {
    readonly id: FieldRef<"Attachment", 'String'>
    readonly taskId: FieldRef<"Attachment", 'String'>
    readonly fileId: FieldRef<"Attachment", 'String'>
    readonly name: FieldRef<"Attachment", 'String'>
    readonly mimeType: FieldRef<"Attachment", 'String'>
    readonly size: FieldRef<"Attachment", 'Int'>
    readonly addedBy: FieldRef<"Attachment", 'String'>
    readonly createdAt: FieldRef<"Attachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attachment findUnique
   */
  export type AttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findUniqueOrThrow
   */
  export type AttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findFirst
   */
  export type AttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findFirstOrThrow
   */
  export type AttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findMany
   */
  export type AttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachments to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment create
   */
  export type AttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Attachment.
     */
    data: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
  }

  /**
   * Attachment createMany
   */
  export type AttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attachment createManyAndReturn
   */
  export type AttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attachment update
   */
  export type AttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Attachment.
     */
    data: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
    /**
     * Choose, which Attachment to update.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment updateMany
   */
  export type AttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attachments.
     */
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyInput>
    /**
     * Filter which Attachments to update
     */
    where?: AttachmentWhereInput
  }

  /**
   * Attachment upsert
   */
  export type AttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Attachment to update in case it exists.
     */
    where: AttachmentWhereUniqueInput
    /**
     * In case the Attachment found by the `where` argument doesn't exist, create a new Attachment with this data.
     */
    create: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
    /**
     * In case the Attachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
  }

  /**
   * Attachment delete
   */
  export type AttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter which Attachment to delete.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment deleteMany
   */
  export type AttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachments to delete
     */
    where?: AttachmentWhereInput
  }

  /**
   * Attachment without action
   */
  export type AttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
  }


  /**
   * Model TimeEntry
   */

  export type AggregateTimeEntry = {
    _count: TimeEntryCountAggregateOutputType | null
    _avg: TimeEntryAvgAggregateOutputType | null
    _sum: TimeEntrySumAggregateOutputType | null
    _min: TimeEntryMinAggregateOutputType | null
    _max: TimeEntryMaxAggregateOutputType | null
  }

  export type TimeEntryAvgAggregateOutputType = {
    hours: number | null
  }

  export type TimeEntrySumAggregateOutputType = {
    hours: number | null
  }

  export type TimeEntryMinAggregateOutputType = {
    id: string | null
    taskId: string | null
    userId: string | null
    hours: number | null
    description: string | null
    date: Date | null
    createdAt: Date | null
  }

  export type TimeEntryMaxAggregateOutputType = {
    id: string | null
    taskId: string | null
    userId: string | null
    hours: number | null
    description: string | null
    date: Date | null
    createdAt: Date | null
  }

  export type TimeEntryCountAggregateOutputType = {
    id: number
    taskId: number
    userId: number
    hours: number
    description: number
    date: number
    createdAt: number
    _all: number
  }


  export type TimeEntryAvgAggregateInputType = {
    hours?: true
  }

  export type TimeEntrySumAggregateInputType = {
    hours?: true
  }

  export type TimeEntryMinAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    hours?: true
    description?: true
    date?: true
    createdAt?: true
  }

  export type TimeEntryMaxAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    hours?: true
    description?: true
    date?: true
    createdAt?: true
  }

  export type TimeEntryCountAggregateInputType = {
    id?: true
    taskId?: true
    userId?: true
    hours?: true
    description?: true
    date?: true
    createdAt?: true
    _all?: true
  }

  export type TimeEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TimeEntry to aggregate.
     */
    where?: TimeEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimeEntries to fetch.
     */
    orderBy?: TimeEntryOrderByWithRelationInput | TimeEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TimeEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimeEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimeEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TimeEntries
    **/
    _count?: true | TimeEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TimeEntryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TimeEntrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TimeEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TimeEntryMaxAggregateInputType
  }

  export type GetTimeEntryAggregateType<T extends TimeEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateTimeEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTimeEntry[P]>
      : GetScalarType<T[P], AggregateTimeEntry[P]>
  }




  export type TimeEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TimeEntryWhereInput
    orderBy?: TimeEntryOrderByWithAggregationInput | TimeEntryOrderByWithAggregationInput[]
    by: TimeEntryScalarFieldEnum[] | TimeEntryScalarFieldEnum
    having?: TimeEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TimeEntryCountAggregateInputType | true
    _avg?: TimeEntryAvgAggregateInputType
    _sum?: TimeEntrySumAggregateInputType
    _min?: TimeEntryMinAggregateInputType
    _max?: TimeEntryMaxAggregateInputType
  }

  export type TimeEntryGroupByOutputType = {
    id: string
    taskId: string
    userId: string
    hours: number
    description: string | null
    date: Date
    createdAt: Date
    _count: TimeEntryCountAggregateOutputType | null
    _avg: TimeEntryAvgAggregateOutputType | null
    _sum: TimeEntrySumAggregateOutputType | null
    _min: TimeEntryMinAggregateOutputType | null
    _max: TimeEntryMaxAggregateOutputType | null
  }

  type GetTimeEntryGroupByPayload<T extends TimeEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TimeEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TimeEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TimeEntryGroupByOutputType[P]>
            : GetScalarType<T[P], TimeEntryGroupByOutputType[P]>
        }
      >
    >


  export type TimeEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    userId?: boolean
    hours?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["timeEntry"]>

  export type TimeEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    taskId?: boolean
    userId?: boolean
    hours?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["timeEntry"]>

  export type TimeEntrySelectScalar = {
    id?: boolean
    taskId?: boolean
    userId?: boolean
    hours?: boolean
    description?: boolean
    date?: boolean
    createdAt?: boolean
  }

  export type TimeEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }
  export type TimeEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }

  export type $TimeEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TimeEntry"
    objects: {
      task: Prisma.$TaskPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      taskId: string
      userId: string
      hours: number
      description: string | null
      date: Date
      createdAt: Date
    }, ExtArgs["result"]["timeEntry"]>
    composites: {}
  }

  type TimeEntryGetPayload<S extends boolean | null | undefined | TimeEntryDefaultArgs> = $Result.GetResult<Prisma.$TimeEntryPayload, S>

  type TimeEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TimeEntryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TimeEntryCountAggregateInputType | true
    }

  export interface TimeEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TimeEntry'], meta: { name: 'TimeEntry' } }
    /**
     * Find zero or one TimeEntry that matches the filter.
     * @param {TimeEntryFindUniqueArgs} args - Arguments to find a TimeEntry
     * @example
     * // Get one TimeEntry
     * const timeEntry = await prisma.timeEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TimeEntryFindUniqueArgs>(args: SelectSubset<T, TimeEntryFindUniqueArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TimeEntry that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TimeEntryFindUniqueOrThrowArgs} args - Arguments to find a TimeEntry
     * @example
     * // Get one TimeEntry
     * const timeEntry = await prisma.timeEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TimeEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, TimeEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TimeEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryFindFirstArgs} args - Arguments to find a TimeEntry
     * @example
     * // Get one TimeEntry
     * const timeEntry = await prisma.timeEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TimeEntryFindFirstArgs>(args?: SelectSubset<T, TimeEntryFindFirstArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TimeEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryFindFirstOrThrowArgs} args - Arguments to find a TimeEntry
     * @example
     * // Get one TimeEntry
     * const timeEntry = await prisma.timeEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TimeEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, TimeEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TimeEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TimeEntries
     * const timeEntries = await prisma.timeEntry.findMany()
     * 
     * // Get first 10 TimeEntries
     * const timeEntries = await prisma.timeEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const timeEntryWithIdOnly = await prisma.timeEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TimeEntryFindManyArgs>(args?: SelectSubset<T, TimeEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TimeEntry.
     * @param {TimeEntryCreateArgs} args - Arguments to create a TimeEntry.
     * @example
     * // Create one TimeEntry
     * const TimeEntry = await prisma.timeEntry.create({
     *   data: {
     *     // ... data to create a TimeEntry
     *   }
     * })
     * 
     */
    create<T extends TimeEntryCreateArgs>(args: SelectSubset<T, TimeEntryCreateArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TimeEntries.
     * @param {TimeEntryCreateManyArgs} args - Arguments to create many TimeEntries.
     * @example
     * // Create many TimeEntries
     * const timeEntry = await prisma.timeEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TimeEntryCreateManyArgs>(args?: SelectSubset<T, TimeEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TimeEntries and returns the data saved in the database.
     * @param {TimeEntryCreateManyAndReturnArgs} args - Arguments to create many TimeEntries.
     * @example
     * // Create many TimeEntries
     * const timeEntry = await prisma.timeEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TimeEntries and only return the `id`
     * const timeEntryWithIdOnly = await prisma.timeEntry.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TimeEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, TimeEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TimeEntry.
     * @param {TimeEntryDeleteArgs} args - Arguments to delete one TimeEntry.
     * @example
     * // Delete one TimeEntry
     * const TimeEntry = await prisma.timeEntry.delete({
     *   where: {
     *     // ... filter to delete one TimeEntry
     *   }
     * })
     * 
     */
    delete<T extends TimeEntryDeleteArgs>(args: SelectSubset<T, TimeEntryDeleteArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TimeEntry.
     * @param {TimeEntryUpdateArgs} args - Arguments to update one TimeEntry.
     * @example
     * // Update one TimeEntry
     * const timeEntry = await prisma.timeEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TimeEntryUpdateArgs>(args: SelectSubset<T, TimeEntryUpdateArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TimeEntries.
     * @param {TimeEntryDeleteManyArgs} args - Arguments to filter TimeEntries to delete.
     * @example
     * // Delete a few TimeEntries
     * const { count } = await prisma.timeEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TimeEntryDeleteManyArgs>(args?: SelectSubset<T, TimeEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TimeEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TimeEntries
     * const timeEntry = await prisma.timeEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TimeEntryUpdateManyArgs>(args: SelectSubset<T, TimeEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TimeEntry.
     * @param {TimeEntryUpsertArgs} args - Arguments to update or create a TimeEntry.
     * @example
     * // Update or create a TimeEntry
     * const timeEntry = await prisma.timeEntry.upsert({
     *   create: {
     *     // ... data to create a TimeEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TimeEntry we want to update
     *   }
     * })
     */
    upsert<T extends TimeEntryUpsertArgs>(args: SelectSubset<T, TimeEntryUpsertArgs<ExtArgs>>): Prisma__TimeEntryClient<$Result.GetResult<Prisma.$TimeEntryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TimeEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryCountArgs} args - Arguments to filter TimeEntries to count.
     * @example
     * // Count the number of TimeEntries
     * const count = await prisma.timeEntry.count({
     *   where: {
     *     // ... the filter for the TimeEntries we want to count
     *   }
     * })
    **/
    count<T extends TimeEntryCountArgs>(
      args?: Subset<T, TimeEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TimeEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TimeEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TimeEntryAggregateArgs>(args: Subset<T, TimeEntryAggregateArgs>): Prisma.PrismaPromise<GetTimeEntryAggregateType<T>>

    /**
     * Group by TimeEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TimeEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TimeEntryGroupByArgs['orderBy'] }
        : { orderBy?: TimeEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TimeEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTimeEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TimeEntry model
   */
  readonly fields: TimeEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TimeEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TimeEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    task<T extends TaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TaskDefaultArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TimeEntry model
   */ 
  interface TimeEntryFieldRefs {
    readonly id: FieldRef<"TimeEntry", 'String'>
    readonly taskId: FieldRef<"TimeEntry", 'String'>
    readonly userId: FieldRef<"TimeEntry", 'String'>
    readonly hours: FieldRef<"TimeEntry", 'Float'>
    readonly description: FieldRef<"TimeEntry", 'String'>
    readonly date: FieldRef<"TimeEntry", 'DateTime'>
    readonly createdAt: FieldRef<"TimeEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TimeEntry findUnique
   */
  export type TimeEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter, which TimeEntry to fetch.
     */
    where: TimeEntryWhereUniqueInput
  }

  /**
   * TimeEntry findUniqueOrThrow
   */
  export type TimeEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter, which TimeEntry to fetch.
     */
    where: TimeEntryWhereUniqueInput
  }

  /**
   * TimeEntry findFirst
   */
  export type TimeEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter, which TimeEntry to fetch.
     */
    where?: TimeEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimeEntries to fetch.
     */
    orderBy?: TimeEntryOrderByWithRelationInput | TimeEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TimeEntries.
     */
    cursor?: TimeEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimeEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimeEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TimeEntries.
     */
    distinct?: TimeEntryScalarFieldEnum | TimeEntryScalarFieldEnum[]
  }

  /**
   * TimeEntry findFirstOrThrow
   */
  export type TimeEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter, which TimeEntry to fetch.
     */
    where?: TimeEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimeEntries to fetch.
     */
    orderBy?: TimeEntryOrderByWithRelationInput | TimeEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TimeEntries.
     */
    cursor?: TimeEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimeEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimeEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TimeEntries.
     */
    distinct?: TimeEntryScalarFieldEnum | TimeEntryScalarFieldEnum[]
  }

  /**
   * TimeEntry findMany
   */
  export type TimeEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter, which TimeEntries to fetch.
     */
    where?: TimeEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TimeEntries to fetch.
     */
    orderBy?: TimeEntryOrderByWithRelationInput | TimeEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TimeEntries.
     */
    cursor?: TimeEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TimeEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TimeEntries.
     */
    skip?: number
    distinct?: TimeEntryScalarFieldEnum | TimeEntryScalarFieldEnum[]
  }

  /**
   * TimeEntry create
   */
  export type TimeEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a TimeEntry.
     */
    data: XOR<TimeEntryCreateInput, TimeEntryUncheckedCreateInput>
  }

  /**
   * TimeEntry createMany
   */
  export type TimeEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TimeEntries.
     */
    data: TimeEntryCreateManyInput | TimeEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TimeEntry createManyAndReturn
   */
  export type TimeEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TimeEntries.
     */
    data: TimeEntryCreateManyInput | TimeEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TimeEntry update
   */
  export type TimeEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a TimeEntry.
     */
    data: XOR<TimeEntryUpdateInput, TimeEntryUncheckedUpdateInput>
    /**
     * Choose, which TimeEntry to update.
     */
    where: TimeEntryWhereUniqueInput
  }

  /**
   * TimeEntry updateMany
   */
  export type TimeEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TimeEntries.
     */
    data: XOR<TimeEntryUpdateManyMutationInput, TimeEntryUncheckedUpdateManyInput>
    /**
     * Filter which TimeEntries to update
     */
    where?: TimeEntryWhereInput
  }

  /**
   * TimeEntry upsert
   */
  export type TimeEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the TimeEntry to update in case it exists.
     */
    where: TimeEntryWhereUniqueInput
    /**
     * In case the TimeEntry found by the `where` argument doesn't exist, create a new TimeEntry with this data.
     */
    create: XOR<TimeEntryCreateInput, TimeEntryUncheckedCreateInput>
    /**
     * In case the TimeEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TimeEntryUpdateInput, TimeEntryUncheckedUpdateInput>
  }

  /**
   * TimeEntry delete
   */
  export type TimeEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
    /**
     * Filter which TimeEntry to delete.
     */
    where: TimeEntryWhereUniqueInput
  }

  /**
   * TimeEntry deleteMany
   */
  export type TimeEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TimeEntries to delete
     */
    where?: TimeEntryWhereInput
  }

  /**
   * TimeEntry without action
   */
  export type TimeEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeEntry
     */
    select?: TimeEntrySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TimeEntryInclude<ExtArgs> | null
  }


  /**
   * Model TaskWatcher
   */

  export type AggregateTaskWatcher = {
    _count: TaskWatcherCountAggregateOutputType | null
    _min: TaskWatcherMinAggregateOutputType | null
    _max: TaskWatcherMaxAggregateOutputType | null
  }

  export type TaskWatcherMinAggregateOutputType = {
    taskId: string | null
    userId: string | null
  }

  export type TaskWatcherMaxAggregateOutputType = {
    taskId: string | null
    userId: string | null
  }

  export type TaskWatcherCountAggregateOutputType = {
    taskId: number
    userId: number
    _all: number
  }


  export type TaskWatcherMinAggregateInputType = {
    taskId?: true
    userId?: true
  }

  export type TaskWatcherMaxAggregateInputType = {
    taskId?: true
    userId?: true
  }

  export type TaskWatcherCountAggregateInputType = {
    taskId?: true
    userId?: true
    _all?: true
  }

  export type TaskWatcherAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaskWatcher to aggregate.
     */
    where?: TaskWatcherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskWatchers to fetch.
     */
    orderBy?: TaskWatcherOrderByWithRelationInput | TaskWatcherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TaskWatcherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskWatchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskWatchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TaskWatchers
    **/
    _count?: true | TaskWatcherCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TaskWatcherMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TaskWatcherMaxAggregateInputType
  }

  export type GetTaskWatcherAggregateType<T extends TaskWatcherAggregateArgs> = {
        [P in keyof T & keyof AggregateTaskWatcher]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTaskWatcher[P]>
      : GetScalarType<T[P], AggregateTaskWatcher[P]>
  }




  export type TaskWatcherGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TaskWatcherWhereInput
    orderBy?: TaskWatcherOrderByWithAggregationInput | TaskWatcherOrderByWithAggregationInput[]
    by: TaskWatcherScalarFieldEnum[] | TaskWatcherScalarFieldEnum
    having?: TaskWatcherScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TaskWatcherCountAggregateInputType | true
    _min?: TaskWatcherMinAggregateInputType
    _max?: TaskWatcherMaxAggregateInputType
  }

  export type TaskWatcherGroupByOutputType = {
    taskId: string
    userId: string
    _count: TaskWatcherCountAggregateOutputType | null
    _min: TaskWatcherMinAggregateOutputType | null
    _max: TaskWatcherMaxAggregateOutputType | null
  }

  type GetTaskWatcherGroupByPayload<T extends TaskWatcherGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TaskWatcherGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TaskWatcherGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TaskWatcherGroupByOutputType[P]>
            : GetScalarType<T[P], TaskWatcherGroupByOutputType[P]>
        }
      >
    >


  export type TaskWatcherSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    taskId?: boolean
    userId?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["taskWatcher"]>

  export type TaskWatcherSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    taskId?: boolean
    userId?: boolean
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["taskWatcher"]>

  export type TaskWatcherSelectScalar = {
    taskId?: boolean
    userId?: boolean
  }

  export type TaskWatcherInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }
  export type TaskWatcherIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    task?: boolean | TaskDefaultArgs<ExtArgs>
  }

  export type $TaskWatcherPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TaskWatcher"
    objects: {
      task: Prisma.$TaskPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      taskId: string
      userId: string
    }, ExtArgs["result"]["taskWatcher"]>
    composites: {}
  }

  type TaskWatcherGetPayload<S extends boolean | null | undefined | TaskWatcherDefaultArgs> = $Result.GetResult<Prisma.$TaskWatcherPayload, S>

  type TaskWatcherCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TaskWatcherFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TaskWatcherCountAggregateInputType | true
    }

  export interface TaskWatcherDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TaskWatcher'], meta: { name: 'TaskWatcher' } }
    /**
     * Find zero or one TaskWatcher that matches the filter.
     * @param {TaskWatcherFindUniqueArgs} args - Arguments to find a TaskWatcher
     * @example
     * // Get one TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TaskWatcherFindUniqueArgs>(args: SelectSubset<T, TaskWatcherFindUniqueArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TaskWatcher that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TaskWatcherFindUniqueOrThrowArgs} args - Arguments to find a TaskWatcher
     * @example
     * // Get one TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TaskWatcherFindUniqueOrThrowArgs>(args: SelectSubset<T, TaskWatcherFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TaskWatcher that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherFindFirstArgs} args - Arguments to find a TaskWatcher
     * @example
     * // Get one TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TaskWatcherFindFirstArgs>(args?: SelectSubset<T, TaskWatcherFindFirstArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TaskWatcher that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherFindFirstOrThrowArgs} args - Arguments to find a TaskWatcher
     * @example
     * // Get one TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TaskWatcherFindFirstOrThrowArgs>(args?: SelectSubset<T, TaskWatcherFindFirstOrThrowArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TaskWatchers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TaskWatchers
     * const taskWatchers = await prisma.taskWatcher.findMany()
     * 
     * // Get first 10 TaskWatchers
     * const taskWatchers = await prisma.taskWatcher.findMany({ take: 10 })
     * 
     * // Only select the `taskId`
     * const taskWatcherWithTaskIdOnly = await prisma.taskWatcher.findMany({ select: { taskId: true } })
     * 
     */
    findMany<T extends TaskWatcherFindManyArgs>(args?: SelectSubset<T, TaskWatcherFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TaskWatcher.
     * @param {TaskWatcherCreateArgs} args - Arguments to create a TaskWatcher.
     * @example
     * // Create one TaskWatcher
     * const TaskWatcher = await prisma.taskWatcher.create({
     *   data: {
     *     // ... data to create a TaskWatcher
     *   }
     * })
     * 
     */
    create<T extends TaskWatcherCreateArgs>(args: SelectSubset<T, TaskWatcherCreateArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TaskWatchers.
     * @param {TaskWatcherCreateManyArgs} args - Arguments to create many TaskWatchers.
     * @example
     * // Create many TaskWatchers
     * const taskWatcher = await prisma.taskWatcher.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TaskWatcherCreateManyArgs>(args?: SelectSubset<T, TaskWatcherCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TaskWatchers and returns the data saved in the database.
     * @param {TaskWatcherCreateManyAndReturnArgs} args - Arguments to create many TaskWatchers.
     * @example
     * // Create many TaskWatchers
     * const taskWatcher = await prisma.taskWatcher.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TaskWatchers and only return the `taskId`
     * const taskWatcherWithTaskIdOnly = await prisma.taskWatcher.createManyAndReturn({ 
     *   select: { taskId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TaskWatcherCreateManyAndReturnArgs>(args?: SelectSubset<T, TaskWatcherCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TaskWatcher.
     * @param {TaskWatcherDeleteArgs} args - Arguments to delete one TaskWatcher.
     * @example
     * // Delete one TaskWatcher
     * const TaskWatcher = await prisma.taskWatcher.delete({
     *   where: {
     *     // ... filter to delete one TaskWatcher
     *   }
     * })
     * 
     */
    delete<T extends TaskWatcherDeleteArgs>(args: SelectSubset<T, TaskWatcherDeleteArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TaskWatcher.
     * @param {TaskWatcherUpdateArgs} args - Arguments to update one TaskWatcher.
     * @example
     * // Update one TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TaskWatcherUpdateArgs>(args: SelectSubset<T, TaskWatcherUpdateArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TaskWatchers.
     * @param {TaskWatcherDeleteManyArgs} args - Arguments to filter TaskWatchers to delete.
     * @example
     * // Delete a few TaskWatchers
     * const { count } = await prisma.taskWatcher.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TaskWatcherDeleteManyArgs>(args?: SelectSubset<T, TaskWatcherDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TaskWatchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TaskWatchers
     * const taskWatcher = await prisma.taskWatcher.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TaskWatcherUpdateManyArgs>(args: SelectSubset<T, TaskWatcherUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TaskWatcher.
     * @param {TaskWatcherUpsertArgs} args - Arguments to update or create a TaskWatcher.
     * @example
     * // Update or create a TaskWatcher
     * const taskWatcher = await prisma.taskWatcher.upsert({
     *   create: {
     *     // ... data to create a TaskWatcher
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TaskWatcher we want to update
     *   }
     * })
     */
    upsert<T extends TaskWatcherUpsertArgs>(args: SelectSubset<T, TaskWatcherUpsertArgs<ExtArgs>>): Prisma__TaskWatcherClient<$Result.GetResult<Prisma.$TaskWatcherPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TaskWatchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherCountArgs} args - Arguments to filter TaskWatchers to count.
     * @example
     * // Count the number of TaskWatchers
     * const count = await prisma.taskWatcher.count({
     *   where: {
     *     // ... the filter for the TaskWatchers we want to count
     *   }
     * })
    **/
    count<T extends TaskWatcherCountArgs>(
      args?: Subset<T, TaskWatcherCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TaskWatcherCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TaskWatcher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TaskWatcherAggregateArgs>(args: Subset<T, TaskWatcherAggregateArgs>): Prisma.PrismaPromise<GetTaskWatcherAggregateType<T>>

    /**
     * Group by TaskWatcher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TaskWatcherGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TaskWatcherGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TaskWatcherGroupByArgs['orderBy'] }
        : { orderBy?: TaskWatcherGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TaskWatcherGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTaskWatcherGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TaskWatcher model
   */
  readonly fields: TaskWatcherFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TaskWatcher.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TaskWatcherClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    task<T extends TaskDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TaskDefaultArgs<ExtArgs>>): Prisma__TaskClient<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TaskWatcher model
   */ 
  interface TaskWatcherFieldRefs {
    readonly taskId: FieldRef<"TaskWatcher", 'String'>
    readonly userId: FieldRef<"TaskWatcher", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TaskWatcher findUnique
   */
  export type TaskWatcherFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter, which TaskWatcher to fetch.
     */
    where: TaskWatcherWhereUniqueInput
  }

  /**
   * TaskWatcher findUniqueOrThrow
   */
  export type TaskWatcherFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter, which TaskWatcher to fetch.
     */
    where: TaskWatcherWhereUniqueInput
  }

  /**
   * TaskWatcher findFirst
   */
  export type TaskWatcherFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter, which TaskWatcher to fetch.
     */
    where?: TaskWatcherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskWatchers to fetch.
     */
    orderBy?: TaskWatcherOrderByWithRelationInput | TaskWatcherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaskWatchers.
     */
    cursor?: TaskWatcherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskWatchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskWatchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaskWatchers.
     */
    distinct?: TaskWatcherScalarFieldEnum | TaskWatcherScalarFieldEnum[]
  }

  /**
   * TaskWatcher findFirstOrThrow
   */
  export type TaskWatcherFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter, which TaskWatcher to fetch.
     */
    where?: TaskWatcherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskWatchers to fetch.
     */
    orderBy?: TaskWatcherOrderByWithRelationInput | TaskWatcherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TaskWatchers.
     */
    cursor?: TaskWatcherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskWatchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskWatchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TaskWatchers.
     */
    distinct?: TaskWatcherScalarFieldEnum | TaskWatcherScalarFieldEnum[]
  }

  /**
   * TaskWatcher findMany
   */
  export type TaskWatcherFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter, which TaskWatchers to fetch.
     */
    where?: TaskWatcherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TaskWatchers to fetch.
     */
    orderBy?: TaskWatcherOrderByWithRelationInput | TaskWatcherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TaskWatchers.
     */
    cursor?: TaskWatcherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TaskWatchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TaskWatchers.
     */
    skip?: number
    distinct?: TaskWatcherScalarFieldEnum | TaskWatcherScalarFieldEnum[]
  }

  /**
   * TaskWatcher create
   */
  export type TaskWatcherCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * The data needed to create a TaskWatcher.
     */
    data: XOR<TaskWatcherCreateInput, TaskWatcherUncheckedCreateInput>
  }

  /**
   * TaskWatcher createMany
   */
  export type TaskWatcherCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TaskWatchers.
     */
    data: TaskWatcherCreateManyInput | TaskWatcherCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TaskWatcher createManyAndReturn
   */
  export type TaskWatcherCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TaskWatchers.
     */
    data: TaskWatcherCreateManyInput | TaskWatcherCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TaskWatcher update
   */
  export type TaskWatcherUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * The data needed to update a TaskWatcher.
     */
    data: XOR<TaskWatcherUpdateInput, TaskWatcherUncheckedUpdateInput>
    /**
     * Choose, which TaskWatcher to update.
     */
    where: TaskWatcherWhereUniqueInput
  }

  /**
   * TaskWatcher updateMany
   */
  export type TaskWatcherUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TaskWatchers.
     */
    data: XOR<TaskWatcherUpdateManyMutationInput, TaskWatcherUncheckedUpdateManyInput>
    /**
     * Filter which TaskWatchers to update
     */
    where?: TaskWatcherWhereInput
  }

  /**
   * TaskWatcher upsert
   */
  export type TaskWatcherUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * The filter to search for the TaskWatcher to update in case it exists.
     */
    where: TaskWatcherWhereUniqueInput
    /**
     * In case the TaskWatcher found by the `where` argument doesn't exist, create a new TaskWatcher with this data.
     */
    create: XOR<TaskWatcherCreateInput, TaskWatcherUncheckedCreateInput>
    /**
     * In case the TaskWatcher was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TaskWatcherUpdateInput, TaskWatcherUncheckedUpdateInput>
  }

  /**
   * TaskWatcher delete
   */
  export type TaskWatcherDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
    /**
     * Filter which TaskWatcher to delete.
     */
    where: TaskWatcherWhereUniqueInput
  }

  /**
   * TaskWatcher deleteMany
   */
  export type TaskWatcherDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TaskWatchers to delete
     */
    where?: TaskWatcherWhereInput
  }

  /**
   * TaskWatcher without action
   */
  export type TaskWatcherDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TaskWatcher
     */
    select?: TaskWatcherSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TaskWatcherInclude<ExtArgs> | null
  }


  /**
   * Model Activity
   */

  export type AggregateActivity = {
    _count: ActivityCountAggregateOutputType | null
    _min: ActivityMinAggregateOutputType | null
    _max: ActivityMaxAggregateOutputType | null
  }

  export type ActivityMinAggregateOutputType = {
    id: string | null
    boardId: string | null
    taskId: string | null
    userId: string | null
    action: string | null
    createdAt: Date | null
  }

  export type ActivityMaxAggregateOutputType = {
    id: string | null
    boardId: string | null
    taskId: string | null
    userId: string | null
    action: string | null
    createdAt: Date | null
  }

  export type ActivityCountAggregateOutputType = {
    id: number
    boardId: number
    taskId: number
    userId: number
    action: number
    detail: number
    createdAt: number
    _all: number
  }


  export type ActivityMinAggregateInputType = {
    id?: true
    boardId?: true
    taskId?: true
    userId?: true
    action?: true
    createdAt?: true
  }

  export type ActivityMaxAggregateInputType = {
    id?: true
    boardId?: true
    taskId?: true
    userId?: true
    action?: true
    createdAt?: true
  }

  export type ActivityCountAggregateInputType = {
    id?: true
    boardId?: true
    taskId?: true
    userId?: true
    action?: true
    detail?: true
    createdAt?: true
    _all?: true
  }

  export type ActivityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Activity to aggregate.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Activities
    **/
    _count?: true | ActivityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityMaxAggregateInputType
  }

  export type GetActivityAggregateType<T extends ActivityAggregateArgs> = {
        [P in keyof T & keyof AggregateActivity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivity[P]>
      : GetScalarType<T[P], AggregateActivity[P]>
  }




  export type ActivityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityWhereInput
    orderBy?: ActivityOrderByWithAggregationInput | ActivityOrderByWithAggregationInput[]
    by: ActivityScalarFieldEnum[] | ActivityScalarFieldEnum
    having?: ActivityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityCountAggregateInputType | true
    _min?: ActivityMinAggregateInputType
    _max?: ActivityMaxAggregateInputType
  }

  export type ActivityGroupByOutputType = {
    id: string
    boardId: string
    taskId: string | null
    userId: string
    action: string
    detail: JsonValue
    createdAt: Date
    _count: ActivityCountAggregateOutputType | null
    _min: ActivityMinAggregateOutputType | null
    _max: ActivityMaxAggregateOutputType | null
  }

  type GetActivityGroupByPayload<T extends ActivityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityGroupByOutputType[P]>
        }
      >
    >


  export type ActivitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    taskId?: boolean
    userId?: boolean
    action?: boolean
    detail?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activity"]>

  export type ActivitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    boardId?: boolean
    taskId?: boolean
    userId?: boolean
    action?: boolean
    detail?: boolean
    createdAt?: boolean
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activity"]>

  export type ActivitySelectScalar = {
    id?: boolean
    boardId?: boolean
    taskId?: boolean
    userId?: boolean
    action?: boolean
    detail?: boolean
    createdAt?: boolean
  }

  export type ActivityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }
  export type ActivityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    board?: boolean | BoardDefaultArgs<ExtArgs>
  }

  export type $ActivityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Activity"
    objects: {
      board: Prisma.$BoardPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      boardId: string
      taskId: string | null
      userId: string
      action: string
      /**
       * what changed, e.g. { field: "assignee", from: "...", to: "..." }
       */
      detail: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["activity"]>
    composites: {}
  }

  type ActivityGetPayload<S extends boolean | null | undefined | ActivityDefaultArgs> = $Result.GetResult<Prisma.$ActivityPayload, S>

  type ActivityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ActivityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ActivityCountAggregateInputType | true
    }

  export interface ActivityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Activity'], meta: { name: 'Activity' } }
    /**
     * Find zero or one Activity that matches the filter.
     * @param {ActivityFindUniqueArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityFindUniqueArgs>(args: SelectSubset<T, ActivityFindUniqueArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Activity that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ActivityFindUniqueOrThrowArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Activity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindFirstArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityFindFirstArgs>(args?: SelectSubset<T, ActivityFindFirstArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Activity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindFirstOrThrowArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Activities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Activities
     * const activities = await prisma.activity.findMany()
     * 
     * // Get first 10 Activities
     * const activities = await prisma.activity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityWithIdOnly = await prisma.activity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityFindManyArgs>(args?: SelectSubset<T, ActivityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Activity.
     * @param {ActivityCreateArgs} args - Arguments to create a Activity.
     * @example
     * // Create one Activity
     * const Activity = await prisma.activity.create({
     *   data: {
     *     // ... data to create a Activity
     *   }
     * })
     * 
     */
    create<T extends ActivityCreateArgs>(args: SelectSubset<T, ActivityCreateArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Activities.
     * @param {ActivityCreateManyArgs} args - Arguments to create many Activities.
     * @example
     * // Create many Activities
     * const activity = await prisma.activity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityCreateManyArgs>(args?: SelectSubset<T, ActivityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Activities and returns the data saved in the database.
     * @param {ActivityCreateManyAndReturnArgs} args - Arguments to create many Activities.
     * @example
     * // Create many Activities
     * const activity = await prisma.activity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Activities and only return the `id`
     * const activityWithIdOnly = await prisma.activity.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivityCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Activity.
     * @param {ActivityDeleteArgs} args - Arguments to delete one Activity.
     * @example
     * // Delete one Activity
     * const Activity = await prisma.activity.delete({
     *   where: {
     *     // ... filter to delete one Activity
     *   }
     * })
     * 
     */
    delete<T extends ActivityDeleteArgs>(args: SelectSubset<T, ActivityDeleteArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Activity.
     * @param {ActivityUpdateArgs} args - Arguments to update one Activity.
     * @example
     * // Update one Activity
     * const activity = await prisma.activity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityUpdateArgs>(args: SelectSubset<T, ActivityUpdateArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Activities.
     * @param {ActivityDeleteManyArgs} args - Arguments to filter Activities to delete.
     * @example
     * // Delete a few Activities
     * const { count } = await prisma.activity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityDeleteManyArgs>(args?: SelectSubset<T, ActivityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Activities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Activities
     * const activity = await prisma.activity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityUpdateManyArgs>(args: SelectSubset<T, ActivityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Activity.
     * @param {ActivityUpsertArgs} args - Arguments to update or create a Activity.
     * @example
     * // Update or create a Activity
     * const activity = await prisma.activity.upsert({
     *   create: {
     *     // ... data to create a Activity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Activity we want to update
     *   }
     * })
     */
    upsert<T extends ActivityUpsertArgs>(args: SelectSubset<T, ActivityUpsertArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Activities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityCountArgs} args - Arguments to filter Activities to count.
     * @example
     * // Count the number of Activities
     * const count = await prisma.activity.count({
     *   where: {
     *     // ... the filter for the Activities we want to count
     *   }
     * })
    **/
    count<T extends ActivityCountArgs>(
      args?: Subset<T, ActivityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Activity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivityAggregateArgs>(args: Subset<T, ActivityAggregateArgs>): Prisma.PrismaPromise<GetActivityAggregateType<T>>

    /**
     * Group by Activity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityGroupByArgs['orderBy'] }
        : { orderBy?: ActivityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Activity model
   */
  readonly fields: ActivityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Activity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    board<T extends BoardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BoardDefaultArgs<ExtArgs>>): Prisma__BoardClient<$Result.GetResult<Prisma.$BoardPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Activity model
   */ 
  interface ActivityFieldRefs {
    readonly id: FieldRef<"Activity", 'String'>
    readonly boardId: FieldRef<"Activity", 'String'>
    readonly taskId: FieldRef<"Activity", 'String'>
    readonly userId: FieldRef<"Activity", 'String'>
    readonly action: FieldRef<"Activity", 'String'>
    readonly detail: FieldRef<"Activity", 'Json'>
    readonly createdAt: FieldRef<"Activity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Activity findUnique
   */
  export type ActivityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity findUniqueOrThrow
   */
  export type ActivityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity findFirst
   */
  export type ActivityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Activities.
     */
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity findFirstOrThrow
   */
  export type ActivityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Activities.
     */
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity findMany
   */
  export type ActivityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activities to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity create
   */
  export type ActivityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The data needed to create a Activity.
     */
    data: XOR<ActivityCreateInput, ActivityUncheckedCreateInput>
  }

  /**
   * Activity createMany
   */
  export type ActivityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Activities.
     */
    data: ActivityCreateManyInput | ActivityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Activity createManyAndReturn
   */
  export type ActivityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Activities.
     */
    data: ActivityCreateManyInput | ActivityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Activity update
   */
  export type ActivityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The data needed to update a Activity.
     */
    data: XOR<ActivityUpdateInput, ActivityUncheckedUpdateInput>
    /**
     * Choose, which Activity to update.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity updateMany
   */
  export type ActivityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Activities.
     */
    data: XOR<ActivityUpdateManyMutationInput, ActivityUncheckedUpdateManyInput>
    /**
     * Filter which Activities to update
     */
    where?: ActivityWhereInput
  }

  /**
   * Activity upsert
   */
  export type ActivityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The filter to search for the Activity to update in case it exists.
     */
    where: ActivityWhereUniqueInput
    /**
     * In case the Activity found by the `where` argument doesn't exist, create a new Activity with this data.
     */
    create: XOR<ActivityCreateInput, ActivityUncheckedCreateInput>
    /**
     * In case the Activity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityUpdateInput, ActivityUncheckedUpdateInput>
  }

  /**
   * Activity delete
   */
  export type ActivityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter which Activity to delete.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity deleteMany
   */
  export type ActivityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Activities to delete
     */
    where?: ActivityWhereInput
  }

  /**
   * Activity without action
   */
  export type ActivityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserRefScalarFieldEnum: {
    id: 'id',
    name: 'name',
    avatar: 'avatar',
    updatedAt: 'updatedAt'
  };

  export type UserRefScalarFieldEnum = (typeof UserRefScalarFieldEnum)[keyof typeof UserRefScalarFieldEnum]


  export const BoardScalarFieldEnum: {
    id: 'id',
    projectId: 'projectId',
    name: 'name',
    description: 'description',
    keyPrefix: 'keyPrefix',
    lastNumber: 'lastNumber',
    visibility: 'visibility',
    createdBy: 'createdBy',
    archived: 'archived',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BoardScalarFieldEnum = (typeof BoardScalarFieldEnum)[keyof typeof BoardScalarFieldEnum]


  export const ColumnScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    name: 'name',
    color: 'color',
    status: 'status',
    order: 'order',
    wipLimit: 'wipLimit',
    createdAt: 'createdAt'
  };

  export type ColumnScalarFieldEnum = (typeof ColumnScalarFieldEnum)[keyof typeof ColumnScalarFieldEnum]


  export const TaskScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    columnId: 'columnId',
    sprintId: 'sprintId',
    epicId: 'epicId',
    parentId: 'parentId',
    number: 'number',
    key: 'key',
    title: 'title',
    description: 'description',
    type: 'type',
    priority: 'priority',
    status: 'status',
    points: 'points',
    estimatedHours: 'estimatedHours',
    order: 'order',
    dueDate: 'dueDate',
    completedAt: 'completedAt',
    assigneeId: 'assigneeId',
    reporterId: 'reporterId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum]


  export const SprintScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    name: 'name',
    goal: 'goal',
    startDate: 'startDate',
    endDate: 'endDate',
    status: 'status',
    committedPoints: 'committedPoints',
    completedPoints: 'completedPoints',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdAt: 'createdAt'
  };

  export type SprintScalarFieldEnum = (typeof SprintScalarFieldEnum)[keyof typeof SprintScalarFieldEnum]


  export const EpicScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    name: 'name',
    description: 'description',
    color: 'color',
    createdAt: 'createdAt'
  };

  export type EpicScalarFieldEnum = (typeof EpicScalarFieldEnum)[keyof typeof EpicScalarFieldEnum]


  export const LabelScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    name: 'name',
    color: 'color',
    createdAt: 'createdAt'
  };

  export type LabelScalarFieldEnum = (typeof LabelScalarFieldEnum)[keyof typeof LabelScalarFieldEnum]


  export const TaskLabelScalarFieldEnum: {
    taskId: 'taskId',
    labelId: 'labelId'
  };

  export type TaskLabelScalarFieldEnum = (typeof TaskLabelScalarFieldEnum)[keyof typeof TaskLabelScalarFieldEnum]


  export const CommentScalarFieldEnum: {
    id: 'id',
    taskId: 'taskId',
    userId: 'userId',
    content: 'content',
    mentions: 'mentions',
    edited: 'edited',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum]


  export const AttachmentScalarFieldEnum: {
    id: 'id',
    taskId: 'taskId',
    fileId: 'fileId',
    name: 'name',
    mimeType: 'mimeType',
    size: 'size',
    addedBy: 'addedBy',
    createdAt: 'createdAt'
  };

  export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum]


  export const TimeEntryScalarFieldEnum: {
    id: 'id',
    taskId: 'taskId',
    userId: 'userId',
    hours: 'hours',
    description: 'description',
    date: 'date',
    createdAt: 'createdAt'
  };

  export type TimeEntryScalarFieldEnum = (typeof TimeEntryScalarFieldEnum)[keyof typeof TimeEntryScalarFieldEnum]


  export const TaskWatcherScalarFieldEnum: {
    taskId: 'taskId',
    userId: 'userId'
  };

  export type TaskWatcherScalarFieldEnum = (typeof TaskWatcherScalarFieldEnum)[keyof typeof TaskWatcherScalarFieldEnum]


  export const ActivityScalarFieldEnum: {
    id: 'id',
    boardId: 'boardId',
    taskId: 'taskId',
    userId: 'userId',
    action: 'action',
    detail: 'detail',
    createdAt: 'createdAt'
  };

  export type ActivityScalarFieldEnum = (typeof ActivityScalarFieldEnum)[keyof typeof ActivityScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'BoardVisibility'
   */
  export type EnumBoardVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BoardVisibility'>
    


  /**
   * Reference to a field of type 'BoardVisibility[]'
   */
  export type ListEnumBoardVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BoardVisibility[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'TaskStatus'
   */
  export type EnumTaskStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskStatus'>
    


  /**
   * Reference to a field of type 'TaskStatus[]'
   */
  export type ListEnumTaskStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'TaskType'
   */
  export type EnumTaskTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskType'>
    


  /**
   * Reference to a field of type 'TaskType[]'
   */
  export type ListEnumTaskTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TaskType[]'>
    


  /**
   * Reference to a field of type 'Priority'
   */
  export type EnumPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Priority'>
    


  /**
   * Reference to a field of type 'Priority[]'
   */
  export type ListEnumPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Priority[]'>
    


  /**
   * Reference to a field of type 'SprintStatus'
   */
  export type EnumSprintStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SprintStatus'>
    


  /**
   * Reference to a field of type 'SprintStatus[]'
   */
  export type ListEnumSprintStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SprintStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    
  /**
   * Deep Input Types
   */


  export type UserRefWhereInput = {
    AND?: UserRefWhereInput | UserRefWhereInput[]
    OR?: UserRefWhereInput[]
    NOT?: UserRefWhereInput | UserRefWhereInput[]
    id?: StringFilter<"UserRef"> | string
    name?: StringFilter<"UserRef"> | string
    avatar?: StringNullableFilter<"UserRef"> | string | null
    updatedAt?: DateTimeFilter<"UserRef"> | Date | string
  }

  export type UserRefOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    avatar?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type UserRefWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserRefWhereInput | UserRefWhereInput[]
    OR?: UserRefWhereInput[]
    NOT?: UserRefWhereInput | UserRefWhereInput[]
    name?: StringFilter<"UserRef"> | string
    avatar?: StringNullableFilter<"UserRef"> | string | null
    updatedAt?: DateTimeFilter<"UserRef"> | Date | string
  }, "id">

  export type UserRefOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    avatar?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: UserRefCountOrderByAggregateInput
    _max?: UserRefMaxOrderByAggregateInput
    _min?: UserRefMinOrderByAggregateInput
  }

  export type UserRefScalarWhereWithAggregatesInput = {
    AND?: UserRefScalarWhereWithAggregatesInput | UserRefScalarWhereWithAggregatesInput[]
    OR?: UserRefScalarWhereWithAggregatesInput[]
    NOT?: UserRefScalarWhereWithAggregatesInput | UserRefScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserRef"> | string
    name?: StringWithAggregatesFilter<"UserRef"> | string
    avatar?: StringNullableWithAggregatesFilter<"UserRef"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"UserRef"> | Date | string
  }

  export type BoardWhereInput = {
    AND?: BoardWhereInput | BoardWhereInput[]
    OR?: BoardWhereInput[]
    NOT?: BoardWhereInput | BoardWhereInput[]
    id?: StringFilter<"Board"> | string
    projectId?: StringFilter<"Board"> | string
    name?: StringFilter<"Board"> | string
    description?: StringNullableFilter<"Board"> | string | null
    keyPrefix?: StringFilter<"Board"> | string
    lastNumber?: IntFilter<"Board"> | number
    visibility?: EnumBoardVisibilityFilter<"Board"> | $Enums.BoardVisibility
    createdBy?: StringFilter<"Board"> | string
    archived?: BoolFilter<"Board"> | boolean
    createdAt?: DateTimeFilter<"Board"> | Date | string
    updatedAt?: DateTimeFilter<"Board"> | Date | string
    columns?: ColumnListRelationFilter
    tasks?: TaskListRelationFilter
    sprints?: SprintListRelationFilter
    epics?: EpicListRelationFilter
    labels?: LabelListRelationFilter
    activity?: ActivityListRelationFilter
  }

  export type BoardOrderByWithRelationInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    keyPrefix?: SortOrder
    lastNumber?: SortOrder
    visibility?: SortOrder
    createdBy?: SortOrder
    archived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    columns?: ColumnOrderByRelationAggregateInput
    tasks?: TaskOrderByRelationAggregateInput
    sprints?: SprintOrderByRelationAggregateInput
    epics?: EpicOrderByRelationAggregateInput
    labels?: LabelOrderByRelationAggregateInput
    activity?: ActivityOrderByRelationAggregateInput
  }

  export type BoardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BoardWhereInput | BoardWhereInput[]
    OR?: BoardWhereInput[]
    NOT?: BoardWhereInput | BoardWhereInput[]
    projectId?: StringFilter<"Board"> | string
    name?: StringFilter<"Board"> | string
    description?: StringNullableFilter<"Board"> | string | null
    keyPrefix?: StringFilter<"Board"> | string
    lastNumber?: IntFilter<"Board"> | number
    visibility?: EnumBoardVisibilityFilter<"Board"> | $Enums.BoardVisibility
    createdBy?: StringFilter<"Board"> | string
    archived?: BoolFilter<"Board"> | boolean
    createdAt?: DateTimeFilter<"Board"> | Date | string
    updatedAt?: DateTimeFilter<"Board"> | Date | string
    columns?: ColumnListRelationFilter
    tasks?: TaskListRelationFilter
    sprints?: SprintListRelationFilter
    epics?: EpicListRelationFilter
    labels?: LabelListRelationFilter
    activity?: ActivityListRelationFilter
  }, "id">

  export type BoardOrderByWithAggregationInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    keyPrefix?: SortOrder
    lastNumber?: SortOrder
    visibility?: SortOrder
    createdBy?: SortOrder
    archived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BoardCountOrderByAggregateInput
    _avg?: BoardAvgOrderByAggregateInput
    _max?: BoardMaxOrderByAggregateInput
    _min?: BoardMinOrderByAggregateInput
    _sum?: BoardSumOrderByAggregateInput
  }

  export type BoardScalarWhereWithAggregatesInput = {
    AND?: BoardScalarWhereWithAggregatesInput | BoardScalarWhereWithAggregatesInput[]
    OR?: BoardScalarWhereWithAggregatesInput[]
    NOT?: BoardScalarWhereWithAggregatesInput | BoardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Board"> | string
    projectId?: StringWithAggregatesFilter<"Board"> | string
    name?: StringWithAggregatesFilter<"Board"> | string
    description?: StringNullableWithAggregatesFilter<"Board"> | string | null
    keyPrefix?: StringWithAggregatesFilter<"Board"> | string
    lastNumber?: IntWithAggregatesFilter<"Board"> | number
    visibility?: EnumBoardVisibilityWithAggregatesFilter<"Board"> | $Enums.BoardVisibility
    createdBy?: StringWithAggregatesFilter<"Board"> | string
    archived?: BoolWithAggregatesFilter<"Board"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Board"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Board"> | Date | string
  }

  export type ColumnWhereInput = {
    AND?: ColumnWhereInput | ColumnWhereInput[]
    OR?: ColumnWhereInput[]
    NOT?: ColumnWhereInput | ColumnWhereInput[]
    id?: StringFilter<"Column"> | string
    boardId?: StringFilter<"Column"> | string
    name?: StringFilter<"Column"> | string
    color?: StringFilter<"Column"> | string
    status?: EnumTaskStatusFilter<"Column"> | $Enums.TaskStatus
    order?: FloatFilter<"Column"> | number
    wipLimit?: IntNullableFilter<"Column"> | number | null
    createdAt?: DateTimeFilter<"Column"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }

  export type ColumnOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    status?: SortOrder
    order?: SortOrder
    wipLimit?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    board?: BoardOrderByWithRelationInput
    tasks?: TaskOrderByRelationAggregateInput
  }

  export type ColumnWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ColumnWhereInput | ColumnWhereInput[]
    OR?: ColumnWhereInput[]
    NOT?: ColumnWhereInput | ColumnWhereInput[]
    boardId?: StringFilter<"Column"> | string
    name?: StringFilter<"Column"> | string
    color?: StringFilter<"Column"> | string
    status?: EnumTaskStatusFilter<"Column"> | $Enums.TaskStatus
    order?: FloatFilter<"Column"> | number
    wipLimit?: IntNullableFilter<"Column"> | number | null
    createdAt?: DateTimeFilter<"Column"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }, "id">

  export type ColumnOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    status?: SortOrder
    order?: SortOrder
    wipLimit?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ColumnCountOrderByAggregateInput
    _avg?: ColumnAvgOrderByAggregateInput
    _max?: ColumnMaxOrderByAggregateInput
    _min?: ColumnMinOrderByAggregateInput
    _sum?: ColumnSumOrderByAggregateInput
  }

  export type ColumnScalarWhereWithAggregatesInput = {
    AND?: ColumnScalarWhereWithAggregatesInput | ColumnScalarWhereWithAggregatesInput[]
    OR?: ColumnScalarWhereWithAggregatesInput[]
    NOT?: ColumnScalarWhereWithAggregatesInput | ColumnScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Column"> | string
    boardId?: StringWithAggregatesFilter<"Column"> | string
    name?: StringWithAggregatesFilter<"Column"> | string
    color?: StringWithAggregatesFilter<"Column"> | string
    status?: EnumTaskStatusWithAggregatesFilter<"Column"> | $Enums.TaskStatus
    order?: FloatWithAggregatesFilter<"Column"> | number
    wipLimit?: IntNullableWithAggregatesFilter<"Column"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Column"> | Date | string
  }

  export type TaskWhereInput = {
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    id?: StringFilter<"Task"> | string
    boardId?: StringFilter<"Task"> | string
    columnId?: StringFilter<"Task"> | string
    sprintId?: StringNullableFilter<"Task"> | string | null
    epicId?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    number?: IntFilter<"Task"> | number
    key?: StringFilter<"Task"> | string
    title?: StringFilter<"Task"> | string
    description?: StringNullableFilter<"Task"> | string | null
    type?: EnumTaskTypeFilter<"Task"> | $Enums.TaskType
    priority?: EnumPriorityFilter<"Task"> | $Enums.Priority
    status?: EnumTaskStatusFilter<"Task"> | $Enums.TaskStatus
    points?: IntNullableFilter<"Task"> | number | null
    estimatedHours?: FloatNullableFilter<"Task"> | number | null
    order?: FloatFilter<"Task"> | number
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Task"> | Date | string | null
    assigneeId?: StringNullableFilter<"Task"> | string | null
    reporterId?: StringFilter<"Task"> | string
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    column?: XOR<ColumnRelationFilter, ColumnWhereInput>
    sprint?: XOR<SprintNullableRelationFilter, SprintWhereInput> | null
    epic?: XOR<EpicNullableRelationFilter, EpicWhereInput> | null
    parent?: XOR<TaskNullableRelationFilter, TaskWhereInput> | null
    subtasks?: TaskListRelationFilter
    labels?: TaskLabelListRelationFilter
    comments?: CommentListRelationFilter
    attachments?: AttachmentListRelationFilter
    timeEntries?: TimeEntryListRelationFilter
    watchers?: TaskWatcherListRelationFilter
  }

  export type TaskOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    columnId?: SortOrder
    sprintId?: SortOrderInput | SortOrder
    epicId?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    number?: SortOrder
    key?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    type?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    points?: SortOrderInput | SortOrder
    estimatedHours?: SortOrderInput | SortOrder
    order?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    assigneeId?: SortOrderInput | SortOrder
    reporterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    board?: BoardOrderByWithRelationInput
    column?: ColumnOrderByWithRelationInput
    sprint?: SprintOrderByWithRelationInput
    epic?: EpicOrderByWithRelationInput
    parent?: TaskOrderByWithRelationInput
    subtasks?: TaskOrderByRelationAggregateInput
    labels?: TaskLabelOrderByRelationAggregateInput
    comments?: CommentOrderByRelationAggregateInput
    attachments?: AttachmentOrderByRelationAggregateInput
    timeEntries?: TimeEntryOrderByRelationAggregateInput
    watchers?: TaskWatcherOrderByRelationAggregateInput
  }

  export type TaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    boardId_number?: TaskBoardIdNumberCompoundUniqueInput
    AND?: TaskWhereInput | TaskWhereInput[]
    OR?: TaskWhereInput[]
    NOT?: TaskWhereInput | TaskWhereInput[]
    boardId?: StringFilter<"Task"> | string
    columnId?: StringFilter<"Task"> | string
    sprintId?: StringNullableFilter<"Task"> | string | null
    epicId?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    number?: IntFilter<"Task"> | number
    key?: StringFilter<"Task"> | string
    title?: StringFilter<"Task"> | string
    description?: StringNullableFilter<"Task"> | string | null
    type?: EnumTaskTypeFilter<"Task"> | $Enums.TaskType
    priority?: EnumPriorityFilter<"Task"> | $Enums.Priority
    status?: EnumTaskStatusFilter<"Task"> | $Enums.TaskStatus
    points?: IntNullableFilter<"Task"> | number | null
    estimatedHours?: FloatNullableFilter<"Task"> | number | null
    order?: FloatFilter<"Task"> | number
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Task"> | Date | string | null
    assigneeId?: StringNullableFilter<"Task"> | string | null
    reporterId?: StringFilter<"Task"> | string
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    column?: XOR<ColumnRelationFilter, ColumnWhereInput>
    sprint?: XOR<SprintNullableRelationFilter, SprintWhereInput> | null
    epic?: XOR<EpicNullableRelationFilter, EpicWhereInput> | null
    parent?: XOR<TaskNullableRelationFilter, TaskWhereInput> | null
    subtasks?: TaskListRelationFilter
    labels?: TaskLabelListRelationFilter
    comments?: CommentListRelationFilter
    attachments?: AttachmentListRelationFilter
    timeEntries?: TimeEntryListRelationFilter
    watchers?: TaskWatcherListRelationFilter
  }, "id" | "boardId_number">

  export type TaskOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    columnId?: SortOrder
    sprintId?: SortOrderInput | SortOrder
    epicId?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    number?: SortOrder
    key?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    type?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    points?: SortOrderInput | SortOrder
    estimatedHours?: SortOrderInput | SortOrder
    order?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    assigneeId?: SortOrderInput | SortOrder
    reporterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TaskCountOrderByAggregateInput
    _avg?: TaskAvgOrderByAggregateInput
    _max?: TaskMaxOrderByAggregateInput
    _min?: TaskMinOrderByAggregateInput
    _sum?: TaskSumOrderByAggregateInput
  }

  export type TaskScalarWhereWithAggregatesInput = {
    AND?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    OR?: TaskScalarWhereWithAggregatesInput[]
    NOT?: TaskScalarWhereWithAggregatesInput | TaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Task"> | string
    boardId?: StringWithAggregatesFilter<"Task"> | string
    columnId?: StringWithAggregatesFilter<"Task"> | string
    sprintId?: StringNullableWithAggregatesFilter<"Task"> | string | null
    epicId?: StringNullableWithAggregatesFilter<"Task"> | string | null
    parentId?: StringNullableWithAggregatesFilter<"Task"> | string | null
    number?: IntWithAggregatesFilter<"Task"> | number
    key?: StringWithAggregatesFilter<"Task"> | string
    title?: StringWithAggregatesFilter<"Task"> | string
    description?: StringNullableWithAggregatesFilter<"Task"> | string | null
    type?: EnumTaskTypeWithAggregatesFilter<"Task"> | $Enums.TaskType
    priority?: EnumPriorityWithAggregatesFilter<"Task"> | $Enums.Priority
    status?: EnumTaskStatusWithAggregatesFilter<"Task"> | $Enums.TaskStatus
    points?: IntNullableWithAggregatesFilter<"Task"> | number | null
    estimatedHours?: FloatNullableWithAggregatesFilter<"Task"> | number | null
    order?: FloatWithAggregatesFilter<"Task"> | number
    dueDate?: DateTimeNullableWithAggregatesFilter<"Task"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"Task"> | Date | string | null
    assigneeId?: StringNullableWithAggregatesFilter<"Task"> | string | null
    reporterId?: StringWithAggregatesFilter<"Task"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Task"> | Date | string
  }

  export type SprintWhereInput = {
    AND?: SprintWhereInput | SprintWhereInput[]
    OR?: SprintWhereInput[]
    NOT?: SprintWhereInput | SprintWhereInput[]
    id?: StringFilter<"Sprint"> | string
    boardId?: StringFilter<"Sprint"> | string
    name?: StringFilter<"Sprint"> | string
    goal?: StringNullableFilter<"Sprint"> | string | null
    startDate?: DateTimeFilter<"Sprint"> | Date | string
    endDate?: DateTimeFilter<"Sprint"> | Date | string
    status?: EnumSprintStatusFilter<"Sprint"> | $Enums.SprintStatus
    committedPoints?: IntNullableFilter<"Sprint"> | number | null
    completedPoints?: IntNullableFilter<"Sprint"> | number | null
    startedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    createdAt?: DateTimeFilter<"Sprint"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }

  export type SprintOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    goal?: SortOrderInput | SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    committedPoints?: SortOrderInput | SortOrder
    completedPoints?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    board?: BoardOrderByWithRelationInput
    tasks?: TaskOrderByRelationAggregateInput
  }

  export type SprintWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SprintWhereInput | SprintWhereInput[]
    OR?: SprintWhereInput[]
    NOT?: SprintWhereInput | SprintWhereInput[]
    boardId?: StringFilter<"Sprint"> | string
    name?: StringFilter<"Sprint"> | string
    goal?: StringNullableFilter<"Sprint"> | string | null
    startDate?: DateTimeFilter<"Sprint"> | Date | string
    endDate?: DateTimeFilter<"Sprint"> | Date | string
    status?: EnumSprintStatusFilter<"Sprint"> | $Enums.SprintStatus
    committedPoints?: IntNullableFilter<"Sprint"> | number | null
    completedPoints?: IntNullableFilter<"Sprint"> | number | null
    startedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    createdAt?: DateTimeFilter<"Sprint"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }, "id">

  export type SprintOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    goal?: SortOrderInput | SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    committedPoints?: SortOrderInput | SortOrder
    completedPoints?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SprintCountOrderByAggregateInput
    _avg?: SprintAvgOrderByAggregateInput
    _max?: SprintMaxOrderByAggregateInput
    _min?: SprintMinOrderByAggregateInput
    _sum?: SprintSumOrderByAggregateInput
  }

  export type SprintScalarWhereWithAggregatesInput = {
    AND?: SprintScalarWhereWithAggregatesInput | SprintScalarWhereWithAggregatesInput[]
    OR?: SprintScalarWhereWithAggregatesInput[]
    NOT?: SprintScalarWhereWithAggregatesInput | SprintScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Sprint"> | string
    boardId?: StringWithAggregatesFilter<"Sprint"> | string
    name?: StringWithAggregatesFilter<"Sprint"> | string
    goal?: StringNullableWithAggregatesFilter<"Sprint"> | string | null
    startDate?: DateTimeWithAggregatesFilter<"Sprint"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Sprint"> | Date | string
    status?: EnumSprintStatusWithAggregatesFilter<"Sprint"> | $Enums.SprintStatus
    committedPoints?: IntNullableWithAggregatesFilter<"Sprint"> | number | null
    completedPoints?: IntNullableWithAggregatesFilter<"Sprint"> | number | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"Sprint"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"Sprint"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Sprint"> | Date | string
  }

  export type EpicWhereInput = {
    AND?: EpicWhereInput | EpicWhereInput[]
    OR?: EpicWhereInput[]
    NOT?: EpicWhereInput | EpicWhereInput[]
    id?: StringFilter<"Epic"> | string
    boardId?: StringFilter<"Epic"> | string
    name?: StringFilter<"Epic"> | string
    description?: StringNullableFilter<"Epic"> | string | null
    color?: StringFilter<"Epic"> | string
    createdAt?: DateTimeFilter<"Epic"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }

  export type EpicOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrder
    createdAt?: SortOrder
    board?: BoardOrderByWithRelationInput
    tasks?: TaskOrderByRelationAggregateInput
  }

  export type EpicWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EpicWhereInput | EpicWhereInput[]
    OR?: EpicWhereInput[]
    NOT?: EpicWhereInput | EpicWhereInput[]
    boardId?: StringFilter<"Epic"> | string
    name?: StringFilter<"Epic"> | string
    description?: StringNullableFilter<"Epic"> | string | null
    color?: StringFilter<"Epic"> | string
    createdAt?: DateTimeFilter<"Epic"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskListRelationFilter
  }, "id">

  export type EpicOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrder
    createdAt?: SortOrder
    _count?: EpicCountOrderByAggregateInput
    _max?: EpicMaxOrderByAggregateInput
    _min?: EpicMinOrderByAggregateInput
  }

  export type EpicScalarWhereWithAggregatesInput = {
    AND?: EpicScalarWhereWithAggregatesInput | EpicScalarWhereWithAggregatesInput[]
    OR?: EpicScalarWhereWithAggregatesInput[]
    NOT?: EpicScalarWhereWithAggregatesInput | EpicScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Epic"> | string
    boardId?: StringWithAggregatesFilter<"Epic"> | string
    name?: StringWithAggregatesFilter<"Epic"> | string
    description?: StringNullableWithAggregatesFilter<"Epic"> | string | null
    color?: StringWithAggregatesFilter<"Epic"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Epic"> | Date | string
  }

  export type LabelWhereInput = {
    AND?: LabelWhereInput | LabelWhereInput[]
    OR?: LabelWhereInput[]
    NOT?: LabelWhereInput | LabelWhereInput[]
    id?: StringFilter<"Label"> | string
    boardId?: StringFilter<"Label"> | string
    name?: StringFilter<"Label"> | string
    color?: StringFilter<"Label"> | string
    createdAt?: DateTimeFilter<"Label"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskLabelListRelationFilter
  }

  export type LabelOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
    board?: BoardOrderByWithRelationInput
    tasks?: TaskLabelOrderByRelationAggregateInput
  }

  export type LabelWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    boardId_name?: LabelBoardIdNameCompoundUniqueInput
    AND?: LabelWhereInput | LabelWhereInput[]
    OR?: LabelWhereInput[]
    NOT?: LabelWhereInput | LabelWhereInput[]
    boardId?: StringFilter<"Label"> | string
    name?: StringFilter<"Label"> | string
    color?: StringFilter<"Label"> | string
    createdAt?: DateTimeFilter<"Label"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
    tasks?: TaskLabelListRelationFilter
  }, "id" | "boardId_name">

  export type LabelOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
    _count?: LabelCountOrderByAggregateInput
    _max?: LabelMaxOrderByAggregateInput
    _min?: LabelMinOrderByAggregateInput
  }

  export type LabelScalarWhereWithAggregatesInput = {
    AND?: LabelScalarWhereWithAggregatesInput | LabelScalarWhereWithAggregatesInput[]
    OR?: LabelScalarWhereWithAggregatesInput[]
    NOT?: LabelScalarWhereWithAggregatesInput | LabelScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Label"> | string
    boardId?: StringWithAggregatesFilter<"Label"> | string
    name?: StringWithAggregatesFilter<"Label"> | string
    color?: StringWithAggregatesFilter<"Label"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Label"> | Date | string
  }

  export type TaskLabelWhereInput = {
    AND?: TaskLabelWhereInput | TaskLabelWhereInput[]
    OR?: TaskLabelWhereInput[]
    NOT?: TaskLabelWhereInput | TaskLabelWhereInput[]
    taskId?: StringFilter<"TaskLabel"> | string
    labelId?: StringFilter<"TaskLabel"> | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
    label?: XOR<LabelRelationFilter, LabelWhereInput>
  }

  export type TaskLabelOrderByWithRelationInput = {
    taskId?: SortOrder
    labelId?: SortOrder
    task?: TaskOrderByWithRelationInput
    label?: LabelOrderByWithRelationInput
  }

  export type TaskLabelWhereUniqueInput = Prisma.AtLeast<{
    taskId_labelId?: TaskLabelTaskIdLabelIdCompoundUniqueInput
    AND?: TaskLabelWhereInput | TaskLabelWhereInput[]
    OR?: TaskLabelWhereInput[]
    NOT?: TaskLabelWhereInput | TaskLabelWhereInput[]
    taskId?: StringFilter<"TaskLabel"> | string
    labelId?: StringFilter<"TaskLabel"> | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
    label?: XOR<LabelRelationFilter, LabelWhereInput>
  }, "taskId_labelId">

  export type TaskLabelOrderByWithAggregationInput = {
    taskId?: SortOrder
    labelId?: SortOrder
    _count?: TaskLabelCountOrderByAggregateInput
    _max?: TaskLabelMaxOrderByAggregateInput
    _min?: TaskLabelMinOrderByAggregateInput
  }

  export type TaskLabelScalarWhereWithAggregatesInput = {
    AND?: TaskLabelScalarWhereWithAggregatesInput | TaskLabelScalarWhereWithAggregatesInput[]
    OR?: TaskLabelScalarWhereWithAggregatesInput[]
    NOT?: TaskLabelScalarWhereWithAggregatesInput | TaskLabelScalarWhereWithAggregatesInput[]
    taskId?: StringWithAggregatesFilter<"TaskLabel"> | string
    labelId?: StringWithAggregatesFilter<"TaskLabel"> | string
  }

  export type CommentWhereInput = {
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    id?: StringFilter<"Comment"> | string
    taskId?: StringFilter<"Comment"> | string
    userId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    mentions?: StringNullableListFilter<"Comment">
    edited?: BoolFilter<"Comment"> | boolean
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }

  export type CommentOrderByWithRelationInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    mentions?: SortOrder
    edited?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    task?: TaskOrderByWithRelationInput
  }

  export type CommentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    taskId?: StringFilter<"Comment"> | string
    userId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    mentions?: StringNullableListFilter<"Comment">
    edited?: BoolFilter<"Comment"> | boolean
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }, "id">

  export type CommentOrderByWithAggregationInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    mentions?: SortOrder
    edited?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CommentCountOrderByAggregateInput
    _max?: CommentMaxOrderByAggregateInput
    _min?: CommentMinOrderByAggregateInput
  }

  export type CommentScalarWhereWithAggregatesInput = {
    AND?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    OR?: CommentScalarWhereWithAggregatesInput[]
    NOT?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Comment"> | string
    taskId?: StringWithAggregatesFilter<"Comment"> | string
    userId?: StringWithAggregatesFilter<"Comment"> | string
    content?: StringWithAggregatesFilter<"Comment"> | string
    mentions?: StringNullableListFilter<"Comment">
    edited?: BoolWithAggregatesFilter<"Comment"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
  }

  export type AttachmentWhereInput = {
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    id?: StringFilter<"Attachment"> | string
    taskId?: StringFilter<"Attachment"> | string
    fileId?: StringFilter<"Attachment"> | string
    name?: StringFilter<"Attachment"> | string
    mimeType?: StringFilter<"Attachment"> | string
    size?: IntFilter<"Attachment"> | number
    addedBy?: StringFilter<"Attachment"> | string
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }

  export type AttachmentOrderByWithRelationInput = {
    id?: SortOrder
    taskId?: SortOrder
    fileId?: SortOrder
    name?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    addedBy?: SortOrder
    createdAt?: SortOrder
    task?: TaskOrderByWithRelationInput
  }

  export type AttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    taskId_fileId?: AttachmentTaskIdFileIdCompoundUniqueInput
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    taskId?: StringFilter<"Attachment"> | string
    fileId?: StringFilter<"Attachment"> | string
    name?: StringFilter<"Attachment"> | string
    mimeType?: StringFilter<"Attachment"> | string
    size?: IntFilter<"Attachment"> | number
    addedBy?: StringFilter<"Attachment"> | string
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }, "id" | "taskId_fileId">

  export type AttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    taskId?: SortOrder
    fileId?: SortOrder
    name?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    addedBy?: SortOrder
    createdAt?: SortOrder
    _count?: AttachmentCountOrderByAggregateInput
    _avg?: AttachmentAvgOrderByAggregateInput
    _max?: AttachmentMaxOrderByAggregateInput
    _min?: AttachmentMinOrderByAggregateInput
    _sum?: AttachmentSumOrderByAggregateInput
  }

  export type AttachmentScalarWhereWithAggregatesInput = {
    AND?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    OR?: AttachmentScalarWhereWithAggregatesInput[]
    NOT?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attachment"> | string
    taskId?: StringWithAggregatesFilter<"Attachment"> | string
    fileId?: StringWithAggregatesFilter<"Attachment"> | string
    name?: StringWithAggregatesFilter<"Attachment"> | string
    mimeType?: StringWithAggregatesFilter<"Attachment"> | string
    size?: IntWithAggregatesFilter<"Attachment"> | number
    addedBy?: StringWithAggregatesFilter<"Attachment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Attachment"> | Date | string
  }

  export type TimeEntryWhereInput = {
    AND?: TimeEntryWhereInput | TimeEntryWhereInput[]
    OR?: TimeEntryWhereInput[]
    NOT?: TimeEntryWhereInput | TimeEntryWhereInput[]
    id?: StringFilter<"TimeEntry"> | string
    taskId?: StringFilter<"TimeEntry"> | string
    userId?: StringFilter<"TimeEntry"> | string
    hours?: FloatFilter<"TimeEntry"> | number
    description?: StringNullableFilter<"TimeEntry"> | string | null
    date?: DateTimeFilter<"TimeEntry"> | Date | string
    createdAt?: DateTimeFilter<"TimeEntry"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }

  export type TimeEntryOrderByWithRelationInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    hours?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    task?: TaskOrderByWithRelationInput
  }

  export type TimeEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TimeEntryWhereInput | TimeEntryWhereInput[]
    OR?: TimeEntryWhereInput[]
    NOT?: TimeEntryWhereInput | TimeEntryWhereInput[]
    taskId?: StringFilter<"TimeEntry"> | string
    userId?: StringFilter<"TimeEntry"> | string
    hours?: FloatFilter<"TimeEntry"> | number
    description?: StringNullableFilter<"TimeEntry"> | string | null
    date?: DateTimeFilter<"TimeEntry"> | Date | string
    createdAt?: DateTimeFilter<"TimeEntry"> | Date | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }, "id">

  export type TimeEntryOrderByWithAggregationInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    hours?: SortOrder
    description?: SortOrderInput | SortOrder
    date?: SortOrder
    createdAt?: SortOrder
    _count?: TimeEntryCountOrderByAggregateInput
    _avg?: TimeEntryAvgOrderByAggregateInput
    _max?: TimeEntryMaxOrderByAggregateInput
    _min?: TimeEntryMinOrderByAggregateInput
    _sum?: TimeEntrySumOrderByAggregateInput
  }

  export type TimeEntryScalarWhereWithAggregatesInput = {
    AND?: TimeEntryScalarWhereWithAggregatesInput | TimeEntryScalarWhereWithAggregatesInput[]
    OR?: TimeEntryScalarWhereWithAggregatesInput[]
    NOT?: TimeEntryScalarWhereWithAggregatesInput | TimeEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TimeEntry"> | string
    taskId?: StringWithAggregatesFilter<"TimeEntry"> | string
    userId?: StringWithAggregatesFilter<"TimeEntry"> | string
    hours?: FloatWithAggregatesFilter<"TimeEntry"> | number
    description?: StringNullableWithAggregatesFilter<"TimeEntry"> | string | null
    date?: DateTimeWithAggregatesFilter<"TimeEntry"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"TimeEntry"> | Date | string
  }

  export type TaskWatcherWhereInput = {
    AND?: TaskWatcherWhereInput | TaskWatcherWhereInput[]
    OR?: TaskWatcherWhereInput[]
    NOT?: TaskWatcherWhereInput | TaskWatcherWhereInput[]
    taskId?: StringFilter<"TaskWatcher"> | string
    userId?: StringFilter<"TaskWatcher"> | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }

  export type TaskWatcherOrderByWithRelationInput = {
    taskId?: SortOrder
    userId?: SortOrder
    task?: TaskOrderByWithRelationInput
  }

  export type TaskWatcherWhereUniqueInput = Prisma.AtLeast<{
    taskId_userId?: TaskWatcherTaskIdUserIdCompoundUniqueInput
    AND?: TaskWatcherWhereInput | TaskWatcherWhereInput[]
    OR?: TaskWatcherWhereInput[]
    NOT?: TaskWatcherWhereInput | TaskWatcherWhereInput[]
    taskId?: StringFilter<"TaskWatcher"> | string
    userId?: StringFilter<"TaskWatcher"> | string
    task?: XOR<TaskRelationFilter, TaskWhereInput>
  }, "taskId_userId">

  export type TaskWatcherOrderByWithAggregationInput = {
    taskId?: SortOrder
    userId?: SortOrder
    _count?: TaskWatcherCountOrderByAggregateInput
    _max?: TaskWatcherMaxOrderByAggregateInput
    _min?: TaskWatcherMinOrderByAggregateInput
  }

  export type TaskWatcherScalarWhereWithAggregatesInput = {
    AND?: TaskWatcherScalarWhereWithAggregatesInput | TaskWatcherScalarWhereWithAggregatesInput[]
    OR?: TaskWatcherScalarWhereWithAggregatesInput[]
    NOT?: TaskWatcherScalarWhereWithAggregatesInput | TaskWatcherScalarWhereWithAggregatesInput[]
    taskId?: StringWithAggregatesFilter<"TaskWatcher"> | string
    userId?: StringWithAggregatesFilter<"TaskWatcher"> | string
  }

  export type ActivityWhereInput = {
    AND?: ActivityWhereInput | ActivityWhereInput[]
    OR?: ActivityWhereInput[]
    NOT?: ActivityWhereInput | ActivityWhereInput[]
    id?: StringFilter<"Activity"> | string
    boardId?: StringFilter<"Activity"> | string
    taskId?: StringNullableFilter<"Activity"> | string | null
    userId?: StringFilter<"Activity"> | string
    action?: StringFilter<"Activity"> | string
    detail?: JsonFilter<"Activity">
    createdAt?: DateTimeFilter<"Activity"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
  }

  export type ActivityOrderByWithRelationInput = {
    id?: SortOrder
    boardId?: SortOrder
    taskId?: SortOrderInput | SortOrder
    userId?: SortOrder
    action?: SortOrder
    detail?: SortOrder
    createdAt?: SortOrder
    board?: BoardOrderByWithRelationInput
  }

  export type ActivityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityWhereInput | ActivityWhereInput[]
    OR?: ActivityWhereInput[]
    NOT?: ActivityWhereInput | ActivityWhereInput[]
    boardId?: StringFilter<"Activity"> | string
    taskId?: StringNullableFilter<"Activity"> | string | null
    userId?: StringFilter<"Activity"> | string
    action?: StringFilter<"Activity"> | string
    detail?: JsonFilter<"Activity">
    createdAt?: DateTimeFilter<"Activity"> | Date | string
    board?: XOR<BoardRelationFilter, BoardWhereInput>
  }, "id">

  export type ActivityOrderByWithAggregationInput = {
    id?: SortOrder
    boardId?: SortOrder
    taskId?: SortOrderInput | SortOrder
    userId?: SortOrder
    action?: SortOrder
    detail?: SortOrder
    createdAt?: SortOrder
    _count?: ActivityCountOrderByAggregateInput
    _max?: ActivityMaxOrderByAggregateInput
    _min?: ActivityMinOrderByAggregateInput
  }

  export type ActivityScalarWhereWithAggregatesInput = {
    AND?: ActivityScalarWhereWithAggregatesInput | ActivityScalarWhereWithAggregatesInput[]
    OR?: ActivityScalarWhereWithAggregatesInput[]
    NOT?: ActivityScalarWhereWithAggregatesInput | ActivityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Activity"> | string
    boardId?: StringWithAggregatesFilter<"Activity"> | string
    taskId?: StringNullableWithAggregatesFilter<"Activity"> | string | null
    userId?: StringWithAggregatesFilter<"Activity"> | string
    action?: StringWithAggregatesFilter<"Activity"> | string
    detail?: JsonWithAggregatesFilter<"Activity">
    createdAt?: DateTimeWithAggregatesFilter<"Activity"> | Date | string
  }

  export type UserRefCreateInput = {
    id: string
    name: string
    avatar?: string | null
    updatedAt?: Date | string
  }

  export type UserRefUncheckedCreateInput = {
    id: string
    name: string
    avatar?: string | null
    updatedAt?: Date | string
  }

  export type UserRefUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRefUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRefCreateManyInput = {
    id: string
    name: string
    avatar?: string | null
    updatedAt?: Date | string
  }

  export type UserRefUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserRefUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BoardCreateInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    tasks?: TaskCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type BoardCreateManyInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BoardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BoardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColumnCreateInput = {
    id?: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutColumnsInput
    tasks?: TaskCreateNestedManyWithoutColumnInput
  }

  export type ColumnUncheckedCreateInput = {
    id?: string
    boardId: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutColumnInput
  }

  export type ColumnUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutColumnsNestedInput
    tasks?: TaskUpdateManyWithoutColumnNestedInput
  }

  export type ColumnUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutColumnNestedInput
  }

  export type ColumnCreateManyInput = {
    id?: string
    boardId: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
  }

  export type ColumnUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColumnUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskCreateManyInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SprintCreateInput = {
    id?: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutSprintsInput
    tasks?: TaskCreateNestedManyWithoutSprintInput
  }

  export type SprintUncheckedCreateInput = {
    id?: string
    boardId: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutSprintInput
  }

  export type SprintUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutSprintsNestedInput
    tasks?: TaskUpdateManyWithoutSprintNestedInput
  }

  export type SprintUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutSprintNestedInput
  }

  export type SprintCreateManyInput = {
    id?: string
    boardId: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SprintUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SprintUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicCreateInput = {
    id?: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutEpicsInput
    tasks?: TaskCreateNestedManyWithoutEpicInput
  }

  export type EpicUncheckedCreateInput = {
    id?: string
    boardId: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutEpicInput
  }

  export type EpicUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutEpicsNestedInput
    tasks?: TaskUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutEpicNestedInput
  }

  export type EpicCreateManyInput = {
    id?: string
    boardId: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
  }

  export type EpicUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabelCreateInput = {
    id?: string
    name: string
    color: string
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutLabelsInput
    tasks?: TaskLabelCreateNestedManyWithoutLabelInput
  }

  export type LabelUncheckedCreateInput = {
    id?: string
    boardId: string
    name: string
    color: string
    createdAt?: Date | string
    tasks?: TaskLabelUncheckedCreateNestedManyWithoutLabelInput
  }

  export type LabelUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutLabelsNestedInput
    tasks?: TaskLabelUpdateManyWithoutLabelNestedInput
  }

  export type LabelUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskLabelUncheckedUpdateManyWithoutLabelNestedInput
  }

  export type LabelCreateManyInput = {
    id?: string
    boardId: string
    name: string
    color: string
    createdAt?: Date | string
  }

  export type LabelUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabelUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskLabelCreateInput = {
    task: TaskCreateNestedOneWithoutLabelsInput
    label: LabelCreateNestedOneWithoutTasksInput
  }

  export type TaskLabelUncheckedCreateInput = {
    taskId: string
    labelId: string
  }

  export type TaskLabelUpdateInput = {
    task?: TaskUpdateOneRequiredWithoutLabelsNestedInput
    label?: LabelUpdateOneRequiredWithoutTasksNestedInput
  }

  export type TaskLabelUncheckedUpdateInput = {
    taskId?: StringFieldUpdateOperationsInput | string
    labelId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskLabelCreateManyInput = {
    taskId: string
    labelId: string
  }

  export type TaskLabelUpdateManyMutationInput = {

  }

  export type TaskLabelUncheckedUpdateManyInput = {
    taskId?: StringFieldUpdateOperationsInput | string
    labelId?: StringFieldUpdateOperationsInput | string
  }

  export type CommentCreateInput = {
    id?: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    task: TaskCreateNestedOneWithoutCommentsInput
  }

  export type CommentUncheckedCreateInput = {
    id?: string
    taskId: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    task?: TaskUpdateOneRequiredWithoutCommentsNestedInput
  }

  export type CommentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateManyInput = {
    id?: string
    taskId: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentCreateInput = {
    id?: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
    task: TaskCreateNestedOneWithoutAttachmentsInput
  }

  export type AttachmentUncheckedCreateInput = {
    id?: string
    taskId: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
  }

  export type AttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    task?: TaskUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type AttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentCreateManyInput = {
    id?: string
    taskId: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
  }

  export type AttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryCreateInput = {
    id?: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
    task: TaskCreateNestedOneWithoutTimeEntriesInput
  }

  export type TimeEntryUncheckedCreateInput = {
    id?: string
    taskId: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
  }

  export type TimeEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    task?: TaskUpdateOneRequiredWithoutTimeEntriesNestedInput
  }

  export type TimeEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryCreateManyInput = {
    id?: string
    taskId: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
  }

  export type TimeEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskWatcherCreateInput = {
    userId: string
    task: TaskCreateNestedOneWithoutWatchersInput
  }

  export type TaskWatcherUncheckedCreateInput = {
    taskId: string
    userId: string
  }

  export type TaskWatcherUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    task?: TaskUpdateOneRequiredWithoutWatchersNestedInput
  }

  export type TaskWatcherUncheckedUpdateInput = {
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskWatcherCreateManyInput = {
    taskId: string
    userId: string
  }

  export type TaskWatcherUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskWatcherUncheckedUpdateManyInput = {
    taskId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type ActivityCreateInput = {
    id?: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutActivityInput
  }

  export type ActivityUncheckedCreateInput = {
    id?: string
    boardId: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutActivityNestedInput
  }

  export type ActivityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityCreateManyInput = {
    id?: string
    boardId: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserRefCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    avatar?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserRefMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    avatar?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserRefMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    avatar?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumBoardVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.BoardVisibility | EnumBoardVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumBoardVisibilityFilter<$PrismaModel> | $Enums.BoardVisibility
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ColumnListRelationFilter = {
    every?: ColumnWhereInput
    some?: ColumnWhereInput
    none?: ColumnWhereInput
  }

  export type TaskListRelationFilter = {
    every?: TaskWhereInput
    some?: TaskWhereInput
    none?: TaskWhereInput
  }

  export type SprintListRelationFilter = {
    every?: SprintWhereInput
    some?: SprintWhereInput
    none?: SprintWhereInput
  }

  export type EpicListRelationFilter = {
    every?: EpicWhereInput
    some?: EpicWhereInput
    none?: EpicWhereInput
  }

  export type LabelListRelationFilter = {
    every?: LabelWhereInput
    some?: LabelWhereInput
    none?: LabelWhereInput
  }

  export type ActivityListRelationFilter = {
    every?: ActivityWhereInput
    some?: ActivityWhereInput
    none?: ActivityWhereInput
  }

  export type ColumnOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SprintOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EpicOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LabelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BoardCountOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    keyPrefix?: SortOrder
    lastNumber?: SortOrder
    visibility?: SortOrder
    createdBy?: SortOrder
    archived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardAvgOrderByAggregateInput = {
    lastNumber?: SortOrder
  }

  export type BoardMaxOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    keyPrefix?: SortOrder
    lastNumber?: SortOrder
    visibility?: SortOrder
    createdBy?: SortOrder
    archived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardMinOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    keyPrefix?: SortOrder
    lastNumber?: SortOrder
    visibility?: SortOrder
    createdBy?: SortOrder
    archived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoardSumOrderByAggregateInput = {
    lastNumber?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumBoardVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BoardVisibility | EnumBoardVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumBoardVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.BoardVisibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBoardVisibilityFilter<$PrismaModel>
    _max?: NestedEnumBoardVisibilityFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumTaskStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskStatus | EnumTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskStatusFilter<$PrismaModel> | $Enums.TaskStatus
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoardRelationFilter = {
    is?: BoardWhereInput
    isNot?: BoardWhereInput
  }

  export type ColumnCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    status?: SortOrder
    order?: SortOrder
    wipLimit?: SortOrder
    createdAt?: SortOrder
  }

  export type ColumnAvgOrderByAggregateInput = {
    order?: SortOrder
    wipLimit?: SortOrder
  }

  export type ColumnMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    status?: SortOrder
    order?: SortOrder
    wipLimit?: SortOrder
    createdAt?: SortOrder
  }

  export type ColumnMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    status?: SortOrder
    order?: SortOrder
    wipLimit?: SortOrder
    createdAt?: SortOrder
  }

  export type ColumnSumOrderByAggregateInput = {
    order?: SortOrder
    wipLimit?: SortOrder
  }

  export type EnumTaskStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskStatus | EnumTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskStatusWithAggregatesFilter<$PrismaModel> | $Enums.TaskStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaskStatusFilter<$PrismaModel>
    _max?: NestedEnumTaskStatusFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumTaskTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskType | EnumTaskTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskTypeFilter<$PrismaModel> | $Enums.TaskType
  }

  export type EnumPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.Priority | EnumPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityFilter<$PrismaModel> | $Enums.Priority
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ColumnRelationFilter = {
    is?: ColumnWhereInput
    isNot?: ColumnWhereInput
  }

  export type SprintNullableRelationFilter = {
    is?: SprintWhereInput | null
    isNot?: SprintWhereInput | null
  }

  export type EpicNullableRelationFilter = {
    is?: EpicWhereInput | null
    isNot?: EpicWhereInput | null
  }

  export type TaskNullableRelationFilter = {
    is?: TaskWhereInput | null
    isNot?: TaskWhereInput | null
  }

  export type TaskLabelListRelationFilter = {
    every?: TaskLabelWhereInput
    some?: TaskLabelWhereInput
    none?: TaskLabelWhereInput
  }

  export type CommentListRelationFilter = {
    every?: CommentWhereInput
    some?: CommentWhereInput
    none?: CommentWhereInput
  }

  export type AttachmentListRelationFilter = {
    every?: AttachmentWhereInput
    some?: AttachmentWhereInput
    none?: AttachmentWhereInput
  }

  export type TimeEntryListRelationFilter = {
    every?: TimeEntryWhereInput
    some?: TimeEntryWhereInput
    none?: TimeEntryWhereInput
  }

  export type TaskWatcherListRelationFilter = {
    every?: TaskWatcherWhereInput
    some?: TaskWatcherWhereInput
    none?: TaskWatcherWhereInput
  }

  export type TaskLabelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CommentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TimeEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskWatcherOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TaskBoardIdNumberCompoundUniqueInput = {
    boardId: string
    number: number
  }

  export type TaskCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    columnId?: SortOrder
    sprintId?: SortOrder
    epicId?: SortOrder
    parentId?: SortOrder
    number?: SortOrder
    key?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    points?: SortOrder
    estimatedHours?: SortOrder
    order?: SortOrder
    dueDate?: SortOrder
    completedAt?: SortOrder
    assigneeId?: SortOrder
    reporterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskAvgOrderByAggregateInput = {
    number?: SortOrder
    points?: SortOrder
    estimatedHours?: SortOrder
    order?: SortOrder
  }

  export type TaskMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    columnId?: SortOrder
    sprintId?: SortOrder
    epicId?: SortOrder
    parentId?: SortOrder
    number?: SortOrder
    key?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    points?: SortOrder
    estimatedHours?: SortOrder
    order?: SortOrder
    dueDate?: SortOrder
    completedAt?: SortOrder
    assigneeId?: SortOrder
    reporterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    columnId?: SortOrder
    sprintId?: SortOrder
    epicId?: SortOrder
    parentId?: SortOrder
    number?: SortOrder
    key?: SortOrder
    title?: SortOrder
    description?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    status?: SortOrder
    points?: SortOrder
    estimatedHours?: SortOrder
    order?: SortOrder
    dueDate?: SortOrder
    completedAt?: SortOrder
    assigneeId?: SortOrder
    reporterId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TaskSumOrderByAggregateInput = {
    number?: SortOrder
    points?: SortOrder
    estimatedHours?: SortOrder
    order?: SortOrder
  }

  export type EnumTaskTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskType | EnumTaskTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskTypeWithAggregatesFilter<$PrismaModel> | $Enums.TaskType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaskTypeFilter<$PrismaModel>
    _max?: NestedEnumTaskTypeFilter<$PrismaModel>
  }

  export type EnumPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Priority | EnumPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityWithAggregatesFilter<$PrismaModel> | $Enums.Priority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriorityFilter<$PrismaModel>
    _max?: NestedEnumPriorityFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumSprintStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SprintStatus | EnumSprintStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSprintStatusFilter<$PrismaModel> | $Enums.SprintStatus
  }

  export type SprintCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    goal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    committedPoints?: SortOrder
    completedPoints?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SprintAvgOrderByAggregateInput = {
    committedPoints?: SortOrder
    completedPoints?: SortOrder
  }

  export type SprintMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    goal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    committedPoints?: SortOrder
    completedPoints?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SprintMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    goal?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    status?: SortOrder
    committedPoints?: SortOrder
    completedPoints?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SprintSumOrderByAggregateInput = {
    committedPoints?: SortOrder
    completedPoints?: SortOrder
  }

  export type EnumSprintStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SprintStatus | EnumSprintStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSprintStatusWithAggregatesFilter<$PrismaModel> | $Enums.SprintStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSprintStatusFilter<$PrismaModel>
    _max?: NestedEnumSprintStatusFilter<$PrismaModel>
  }

  export type EpicCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type EpicMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type EpicMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type LabelBoardIdNameCompoundUniqueInput = {
    boardId: string
    name: string
  }

  export type LabelCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type LabelMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type LabelMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    name?: SortOrder
    color?: SortOrder
    createdAt?: SortOrder
  }

  export type TaskRelationFilter = {
    is?: TaskWhereInput
    isNot?: TaskWhereInput
  }

  export type LabelRelationFilter = {
    is?: LabelWhereInput
    isNot?: LabelWhereInput
  }

  export type TaskLabelTaskIdLabelIdCompoundUniqueInput = {
    taskId: string
    labelId: string
  }

  export type TaskLabelCountOrderByAggregateInput = {
    taskId?: SortOrder
    labelId?: SortOrder
  }

  export type TaskLabelMaxOrderByAggregateInput = {
    taskId?: SortOrder
    labelId?: SortOrder
  }

  export type TaskLabelMinOrderByAggregateInput = {
    taskId?: SortOrder
    labelId?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type CommentCountOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    mentions?: SortOrder
    edited?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentMaxOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    edited?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CommentMinOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    content?: SortOrder
    edited?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AttachmentTaskIdFileIdCompoundUniqueInput = {
    taskId: string
    fileId: string
  }

  export type AttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    fileId?: SortOrder
    name?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    addedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AttachmentAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type AttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    fileId?: SortOrder
    name?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    addedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    fileId?: SortOrder
    name?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    addedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type AttachmentSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type TimeEntryCountOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    hours?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
  }

  export type TimeEntryAvgOrderByAggregateInput = {
    hours?: SortOrder
  }

  export type TimeEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    hours?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
  }

  export type TimeEntryMinOrderByAggregateInput = {
    id?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    hours?: SortOrder
    description?: SortOrder
    date?: SortOrder
    createdAt?: SortOrder
  }

  export type TimeEntrySumOrderByAggregateInput = {
    hours?: SortOrder
  }

  export type TaskWatcherTaskIdUserIdCompoundUniqueInput = {
    taskId: string
    userId: string
  }

  export type TaskWatcherCountOrderByAggregateInput = {
    taskId?: SortOrder
    userId?: SortOrder
  }

  export type TaskWatcherMaxOrderByAggregateInput = {
    taskId?: SortOrder
    userId?: SortOrder
  }

  export type TaskWatcherMinOrderByAggregateInput = {
    taskId?: SortOrder
    userId?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ActivityCountOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    detail?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityMaxOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityMinOrderByAggregateInput = {
    id?: SortOrder
    boardId?: SortOrder
    taskId?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ColumnCreateNestedManyWithoutBoardInput = {
    create?: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput> | ColumnCreateWithoutBoardInput[] | ColumnUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ColumnCreateOrConnectWithoutBoardInput | ColumnCreateOrConnectWithoutBoardInput[]
    createMany?: ColumnCreateManyBoardInputEnvelope
    connect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
  }

  export type TaskCreateNestedManyWithoutBoardInput = {
    create?: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput> | TaskCreateWithoutBoardInput[] | TaskUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutBoardInput | TaskCreateOrConnectWithoutBoardInput[]
    createMany?: TaskCreateManyBoardInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type SprintCreateNestedManyWithoutBoardInput = {
    create?: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput> | SprintCreateWithoutBoardInput[] | SprintUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: SprintCreateOrConnectWithoutBoardInput | SprintCreateOrConnectWithoutBoardInput[]
    createMany?: SprintCreateManyBoardInputEnvelope
    connect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
  }

  export type EpicCreateNestedManyWithoutBoardInput = {
    create?: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput> | EpicCreateWithoutBoardInput[] | EpicUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutBoardInput | EpicCreateOrConnectWithoutBoardInput[]
    createMany?: EpicCreateManyBoardInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type LabelCreateNestedManyWithoutBoardInput = {
    create?: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput> | LabelCreateWithoutBoardInput[] | LabelUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: LabelCreateOrConnectWithoutBoardInput | LabelCreateOrConnectWithoutBoardInput[]
    createMany?: LabelCreateManyBoardInputEnvelope
    connect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
  }

  export type ActivityCreateNestedManyWithoutBoardInput = {
    create?: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput> | ActivityCreateWithoutBoardInput[] | ActivityUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ActivityCreateOrConnectWithoutBoardInput | ActivityCreateOrConnectWithoutBoardInput[]
    createMany?: ActivityCreateManyBoardInputEnvelope
    connect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
  }

  export type ColumnUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput> | ColumnCreateWithoutBoardInput[] | ColumnUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ColumnCreateOrConnectWithoutBoardInput | ColumnCreateOrConnectWithoutBoardInput[]
    createMany?: ColumnCreateManyBoardInputEnvelope
    connect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput> | TaskCreateWithoutBoardInput[] | TaskUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutBoardInput | TaskCreateOrConnectWithoutBoardInput[]
    createMany?: TaskCreateManyBoardInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type SprintUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput> | SprintCreateWithoutBoardInput[] | SprintUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: SprintCreateOrConnectWithoutBoardInput | SprintCreateOrConnectWithoutBoardInput[]
    createMany?: SprintCreateManyBoardInputEnvelope
    connect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
  }

  export type EpicUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput> | EpicCreateWithoutBoardInput[] | EpicUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutBoardInput | EpicCreateOrConnectWithoutBoardInput[]
    createMany?: EpicCreateManyBoardInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type LabelUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput> | LabelCreateWithoutBoardInput[] | LabelUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: LabelCreateOrConnectWithoutBoardInput | LabelCreateOrConnectWithoutBoardInput[]
    createMany?: LabelCreateManyBoardInputEnvelope
    connect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
  }

  export type ActivityUncheckedCreateNestedManyWithoutBoardInput = {
    create?: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput> | ActivityCreateWithoutBoardInput[] | ActivityUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ActivityCreateOrConnectWithoutBoardInput | ActivityCreateOrConnectWithoutBoardInput[]
    createMany?: ActivityCreateManyBoardInputEnvelope
    connect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumBoardVisibilityFieldUpdateOperationsInput = {
    set?: $Enums.BoardVisibility
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ColumnUpdateManyWithoutBoardNestedInput = {
    create?: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput> | ColumnCreateWithoutBoardInput[] | ColumnUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ColumnCreateOrConnectWithoutBoardInput | ColumnCreateOrConnectWithoutBoardInput[]
    upsert?: ColumnUpsertWithWhereUniqueWithoutBoardInput | ColumnUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: ColumnCreateManyBoardInputEnvelope
    set?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    disconnect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    delete?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    connect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    update?: ColumnUpdateWithWhereUniqueWithoutBoardInput | ColumnUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: ColumnUpdateManyWithWhereWithoutBoardInput | ColumnUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: ColumnScalarWhereInput | ColumnScalarWhereInput[]
  }

  export type TaskUpdateManyWithoutBoardNestedInput = {
    create?: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput> | TaskCreateWithoutBoardInput[] | TaskUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutBoardInput | TaskCreateOrConnectWithoutBoardInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutBoardInput | TaskUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: TaskCreateManyBoardInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutBoardInput | TaskUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutBoardInput | TaskUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type SprintUpdateManyWithoutBoardNestedInput = {
    create?: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput> | SprintCreateWithoutBoardInput[] | SprintUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: SprintCreateOrConnectWithoutBoardInput | SprintCreateOrConnectWithoutBoardInput[]
    upsert?: SprintUpsertWithWhereUniqueWithoutBoardInput | SprintUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: SprintCreateManyBoardInputEnvelope
    set?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    disconnect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    delete?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    connect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    update?: SprintUpdateWithWhereUniqueWithoutBoardInput | SprintUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: SprintUpdateManyWithWhereWithoutBoardInput | SprintUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: SprintScalarWhereInput | SprintScalarWhereInput[]
  }

  export type EpicUpdateManyWithoutBoardNestedInput = {
    create?: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput> | EpicCreateWithoutBoardInput[] | EpicUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutBoardInput | EpicCreateOrConnectWithoutBoardInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutBoardInput | EpicUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: EpicCreateManyBoardInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutBoardInput | EpicUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutBoardInput | EpicUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type LabelUpdateManyWithoutBoardNestedInput = {
    create?: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput> | LabelCreateWithoutBoardInput[] | LabelUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: LabelCreateOrConnectWithoutBoardInput | LabelCreateOrConnectWithoutBoardInput[]
    upsert?: LabelUpsertWithWhereUniqueWithoutBoardInput | LabelUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: LabelCreateManyBoardInputEnvelope
    set?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    disconnect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    delete?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    connect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    update?: LabelUpdateWithWhereUniqueWithoutBoardInput | LabelUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: LabelUpdateManyWithWhereWithoutBoardInput | LabelUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: LabelScalarWhereInput | LabelScalarWhereInput[]
  }

  export type ActivityUpdateManyWithoutBoardNestedInput = {
    create?: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput> | ActivityCreateWithoutBoardInput[] | ActivityUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ActivityCreateOrConnectWithoutBoardInput | ActivityCreateOrConnectWithoutBoardInput[]
    upsert?: ActivityUpsertWithWhereUniqueWithoutBoardInput | ActivityUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: ActivityCreateManyBoardInputEnvelope
    set?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    disconnect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    delete?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    connect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    update?: ActivityUpdateWithWhereUniqueWithoutBoardInput | ActivityUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: ActivityUpdateManyWithWhereWithoutBoardInput | ActivityUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: ActivityScalarWhereInput | ActivityScalarWhereInput[]
  }

  export type ColumnUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput> | ColumnCreateWithoutBoardInput[] | ColumnUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ColumnCreateOrConnectWithoutBoardInput | ColumnCreateOrConnectWithoutBoardInput[]
    upsert?: ColumnUpsertWithWhereUniqueWithoutBoardInput | ColumnUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: ColumnCreateManyBoardInputEnvelope
    set?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    disconnect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    delete?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    connect?: ColumnWhereUniqueInput | ColumnWhereUniqueInput[]
    update?: ColumnUpdateWithWhereUniqueWithoutBoardInput | ColumnUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: ColumnUpdateManyWithWhereWithoutBoardInput | ColumnUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: ColumnScalarWhereInput | ColumnScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput> | TaskCreateWithoutBoardInput[] | TaskUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutBoardInput | TaskCreateOrConnectWithoutBoardInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutBoardInput | TaskUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: TaskCreateManyBoardInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutBoardInput | TaskUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutBoardInput | TaskUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type SprintUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput> | SprintCreateWithoutBoardInput[] | SprintUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: SprintCreateOrConnectWithoutBoardInput | SprintCreateOrConnectWithoutBoardInput[]
    upsert?: SprintUpsertWithWhereUniqueWithoutBoardInput | SprintUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: SprintCreateManyBoardInputEnvelope
    set?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    disconnect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    delete?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    connect?: SprintWhereUniqueInput | SprintWhereUniqueInput[]
    update?: SprintUpdateWithWhereUniqueWithoutBoardInput | SprintUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: SprintUpdateManyWithWhereWithoutBoardInput | SprintUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: SprintScalarWhereInput | SprintScalarWhereInput[]
  }

  export type EpicUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput> | EpicCreateWithoutBoardInput[] | EpicUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutBoardInput | EpicCreateOrConnectWithoutBoardInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutBoardInput | EpicUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: EpicCreateManyBoardInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutBoardInput | EpicUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutBoardInput | EpicUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type LabelUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput> | LabelCreateWithoutBoardInput[] | LabelUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: LabelCreateOrConnectWithoutBoardInput | LabelCreateOrConnectWithoutBoardInput[]
    upsert?: LabelUpsertWithWhereUniqueWithoutBoardInput | LabelUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: LabelCreateManyBoardInputEnvelope
    set?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    disconnect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    delete?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    connect?: LabelWhereUniqueInput | LabelWhereUniqueInput[]
    update?: LabelUpdateWithWhereUniqueWithoutBoardInput | LabelUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: LabelUpdateManyWithWhereWithoutBoardInput | LabelUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: LabelScalarWhereInput | LabelScalarWhereInput[]
  }

  export type ActivityUncheckedUpdateManyWithoutBoardNestedInput = {
    create?: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput> | ActivityCreateWithoutBoardInput[] | ActivityUncheckedCreateWithoutBoardInput[]
    connectOrCreate?: ActivityCreateOrConnectWithoutBoardInput | ActivityCreateOrConnectWithoutBoardInput[]
    upsert?: ActivityUpsertWithWhereUniqueWithoutBoardInput | ActivityUpsertWithWhereUniqueWithoutBoardInput[]
    createMany?: ActivityCreateManyBoardInputEnvelope
    set?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    disconnect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    delete?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    connect?: ActivityWhereUniqueInput | ActivityWhereUniqueInput[]
    update?: ActivityUpdateWithWhereUniqueWithoutBoardInput | ActivityUpdateWithWhereUniqueWithoutBoardInput[]
    updateMany?: ActivityUpdateManyWithWhereWithoutBoardInput | ActivityUpdateManyWithWhereWithoutBoardInput[]
    deleteMany?: ActivityScalarWhereInput | ActivityScalarWhereInput[]
  }

  export type BoardCreateNestedOneWithoutColumnsInput = {
    create?: XOR<BoardCreateWithoutColumnsInput, BoardUncheckedCreateWithoutColumnsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutColumnsInput
    connect?: BoardWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutColumnInput = {
    create?: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput> | TaskCreateWithoutColumnInput[] | TaskUncheckedCreateWithoutColumnInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutColumnInput | TaskCreateOrConnectWithoutColumnInput[]
    createMany?: TaskCreateManyColumnInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutColumnInput = {
    create?: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput> | TaskCreateWithoutColumnInput[] | TaskUncheckedCreateWithoutColumnInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutColumnInput | TaskCreateOrConnectWithoutColumnInput[]
    createMany?: TaskCreateManyColumnInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type EnumTaskStatusFieldUpdateOperationsInput = {
    set?: $Enums.TaskStatus
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoardUpdateOneRequiredWithoutColumnsNestedInput = {
    create?: XOR<BoardCreateWithoutColumnsInput, BoardUncheckedCreateWithoutColumnsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutColumnsInput
    upsert?: BoardUpsertWithoutColumnsInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutColumnsInput, BoardUpdateWithoutColumnsInput>, BoardUncheckedUpdateWithoutColumnsInput>
  }

  export type TaskUpdateManyWithoutColumnNestedInput = {
    create?: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput> | TaskCreateWithoutColumnInput[] | TaskUncheckedCreateWithoutColumnInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutColumnInput | TaskCreateOrConnectWithoutColumnInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutColumnInput | TaskUpsertWithWhereUniqueWithoutColumnInput[]
    createMany?: TaskCreateManyColumnInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutColumnInput | TaskUpdateWithWhereUniqueWithoutColumnInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutColumnInput | TaskUpdateManyWithWhereWithoutColumnInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutColumnNestedInput = {
    create?: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput> | TaskCreateWithoutColumnInput[] | TaskUncheckedCreateWithoutColumnInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutColumnInput | TaskCreateOrConnectWithoutColumnInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutColumnInput | TaskUpsertWithWhereUniqueWithoutColumnInput[]
    createMany?: TaskCreateManyColumnInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutColumnInput | TaskUpdateWithWhereUniqueWithoutColumnInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutColumnInput | TaskUpdateManyWithWhereWithoutColumnInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type BoardCreateNestedOneWithoutTasksInput = {
    create?: XOR<BoardCreateWithoutTasksInput, BoardUncheckedCreateWithoutTasksInput>
    connectOrCreate?: BoardCreateOrConnectWithoutTasksInput
    connect?: BoardWhereUniqueInput
  }

  export type ColumnCreateNestedOneWithoutTasksInput = {
    create?: XOR<ColumnCreateWithoutTasksInput, ColumnUncheckedCreateWithoutTasksInput>
    connectOrCreate?: ColumnCreateOrConnectWithoutTasksInput
    connect?: ColumnWhereUniqueInput
  }

  export type SprintCreateNestedOneWithoutTasksInput = {
    create?: XOR<SprintCreateWithoutTasksInput, SprintUncheckedCreateWithoutTasksInput>
    connectOrCreate?: SprintCreateOrConnectWithoutTasksInput
    connect?: SprintWhereUniqueInput
  }

  export type EpicCreateNestedOneWithoutTasksInput = {
    create?: XOR<EpicCreateWithoutTasksInput, EpicUncheckedCreateWithoutTasksInput>
    connectOrCreate?: EpicCreateOrConnectWithoutTasksInput
    connect?: EpicWhereUniqueInput
  }

  export type TaskCreateNestedOneWithoutSubtasksInput = {
    create?: XOR<TaskCreateWithoutSubtasksInput, TaskUncheckedCreateWithoutSubtasksInput>
    connectOrCreate?: TaskCreateOrConnectWithoutSubtasksInput
    connect?: TaskWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutParentInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskLabelCreateNestedManyWithoutTaskInput = {
    create?: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput> | TaskLabelCreateWithoutTaskInput[] | TaskLabelUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutTaskInput | TaskLabelCreateOrConnectWithoutTaskInput[]
    createMany?: TaskLabelCreateManyTaskInputEnvelope
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
  }

  export type CommentCreateNestedManyWithoutTaskInput = {
    create?: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput> | CommentCreateWithoutTaskInput[] | CommentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutTaskInput | CommentCreateOrConnectWithoutTaskInput[]
    createMany?: CommentCreateManyTaskInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type AttachmentCreateNestedManyWithoutTaskInput = {
    create?: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput> | AttachmentCreateWithoutTaskInput[] | AttachmentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutTaskInput | AttachmentCreateOrConnectWithoutTaskInput[]
    createMany?: AttachmentCreateManyTaskInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type TimeEntryCreateNestedManyWithoutTaskInput = {
    create?: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput> | TimeEntryCreateWithoutTaskInput[] | TimeEntryUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TimeEntryCreateOrConnectWithoutTaskInput | TimeEntryCreateOrConnectWithoutTaskInput[]
    createMany?: TimeEntryCreateManyTaskInputEnvelope
    connect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
  }

  export type TaskWatcherCreateNestedManyWithoutTaskInput = {
    create?: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput> | TaskWatcherCreateWithoutTaskInput[] | TaskWatcherUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskWatcherCreateOrConnectWithoutTaskInput | TaskWatcherCreateOrConnectWithoutTaskInput[]
    createMany?: TaskWatcherCreateManyTaskInputEnvelope
    connect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskLabelUncheckedCreateNestedManyWithoutTaskInput = {
    create?: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput> | TaskLabelCreateWithoutTaskInput[] | TaskLabelUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutTaskInput | TaskLabelCreateOrConnectWithoutTaskInput[]
    createMany?: TaskLabelCreateManyTaskInputEnvelope
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutTaskInput = {
    create?: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput> | CommentCreateWithoutTaskInput[] | CommentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutTaskInput | CommentCreateOrConnectWithoutTaskInput[]
    createMany?: CommentCreateManyTaskInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type AttachmentUncheckedCreateNestedManyWithoutTaskInput = {
    create?: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput> | AttachmentCreateWithoutTaskInput[] | AttachmentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutTaskInput | AttachmentCreateOrConnectWithoutTaskInput[]
    createMany?: AttachmentCreateManyTaskInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type TimeEntryUncheckedCreateNestedManyWithoutTaskInput = {
    create?: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput> | TimeEntryCreateWithoutTaskInput[] | TimeEntryUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TimeEntryCreateOrConnectWithoutTaskInput | TimeEntryCreateOrConnectWithoutTaskInput[]
    createMany?: TimeEntryCreateManyTaskInputEnvelope
    connect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
  }

  export type TaskWatcherUncheckedCreateNestedManyWithoutTaskInput = {
    create?: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput> | TaskWatcherCreateWithoutTaskInput[] | TaskWatcherUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskWatcherCreateOrConnectWithoutTaskInput | TaskWatcherCreateOrConnectWithoutTaskInput[]
    createMany?: TaskWatcherCreateManyTaskInputEnvelope
    connect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
  }

  export type EnumTaskTypeFieldUpdateOperationsInput = {
    set?: $Enums.TaskType
  }

  export type EnumPriorityFieldUpdateOperationsInput = {
    set?: $Enums.Priority
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoardUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<BoardCreateWithoutTasksInput, BoardUncheckedCreateWithoutTasksInput>
    connectOrCreate?: BoardCreateOrConnectWithoutTasksInput
    upsert?: BoardUpsertWithoutTasksInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutTasksInput, BoardUpdateWithoutTasksInput>, BoardUncheckedUpdateWithoutTasksInput>
  }

  export type ColumnUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<ColumnCreateWithoutTasksInput, ColumnUncheckedCreateWithoutTasksInput>
    connectOrCreate?: ColumnCreateOrConnectWithoutTasksInput
    upsert?: ColumnUpsertWithoutTasksInput
    connect?: ColumnWhereUniqueInput
    update?: XOR<XOR<ColumnUpdateToOneWithWhereWithoutTasksInput, ColumnUpdateWithoutTasksInput>, ColumnUncheckedUpdateWithoutTasksInput>
  }

  export type SprintUpdateOneWithoutTasksNestedInput = {
    create?: XOR<SprintCreateWithoutTasksInput, SprintUncheckedCreateWithoutTasksInput>
    connectOrCreate?: SprintCreateOrConnectWithoutTasksInput
    upsert?: SprintUpsertWithoutTasksInput
    disconnect?: SprintWhereInput | boolean
    delete?: SprintWhereInput | boolean
    connect?: SprintWhereUniqueInput
    update?: XOR<XOR<SprintUpdateToOneWithWhereWithoutTasksInput, SprintUpdateWithoutTasksInput>, SprintUncheckedUpdateWithoutTasksInput>
  }

  export type EpicUpdateOneWithoutTasksNestedInput = {
    create?: XOR<EpicCreateWithoutTasksInput, EpicUncheckedCreateWithoutTasksInput>
    connectOrCreate?: EpicCreateOrConnectWithoutTasksInput
    upsert?: EpicUpsertWithoutTasksInput
    disconnect?: EpicWhereInput | boolean
    delete?: EpicWhereInput | boolean
    connect?: EpicWhereUniqueInput
    update?: XOR<XOR<EpicUpdateToOneWithWhereWithoutTasksInput, EpicUpdateWithoutTasksInput>, EpicUncheckedUpdateWithoutTasksInput>
  }

  export type TaskUpdateOneWithoutSubtasksNestedInput = {
    create?: XOR<TaskCreateWithoutSubtasksInput, TaskUncheckedCreateWithoutSubtasksInput>
    connectOrCreate?: TaskCreateOrConnectWithoutSubtasksInput
    upsert?: TaskUpsertWithoutSubtasksInput
    disconnect?: TaskWhereInput | boolean
    delete?: TaskWhereInput | boolean
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutSubtasksInput, TaskUpdateWithoutSubtasksInput>, TaskUncheckedUpdateWithoutSubtasksInput>
  }

  export type TaskUpdateManyWithoutParentNestedInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutParentInput | TaskUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutParentInput | TaskUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutParentInput | TaskUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskLabelUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput> | TaskLabelCreateWithoutTaskInput[] | TaskLabelUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutTaskInput | TaskLabelCreateOrConnectWithoutTaskInput[]
    upsert?: TaskLabelUpsertWithWhereUniqueWithoutTaskInput | TaskLabelUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TaskLabelCreateManyTaskInputEnvelope
    set?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    disconnect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    delete?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    update?: TaskLabelUpdateWithWhereUniqueWithoutTaskInput | TaskLabelUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TaskLabelUpdateManyWithWhereWithoutTaskInput | TaskLabelUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
  }

  export type CommentUpdateManyWithoutTaskNestedInput = {
    create?: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput> | CommentCreateWithoutTaskInput[] | CommentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutTaskInput | CommentCreateOrConnectWithoutTaskInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutTaskInput | CommentUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: CommentCreateManyTaskInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutTaskInput | CommentUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutTaskInput | CommentUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type AttachmentUpdateManyWithoutTaskNestedInput = {
    create?: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput> | AttachmentCreateWithoutTaskInput[] | AttachmentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutTaskInput | AttachmentCreateOrConnectWithoutTaskInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutTaskInput | AttachmentUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: AttachmentCreateManyTaskInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutTaskInput | AttachmentUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutTaskInput | AttachmentUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type TimeEntryUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput> | TimeEntryCreateWithoutTaskInput[] | TimeEntryUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TimeEntryCreateOrConnectWithoutTaskInput | TimeEntryCreateOrConnectWithoutTaskInput[]
    upsert?: TimeEntryUpsertWithWhereUniqueWithoutTaskInput | TimeEntryUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TimeEntryCreateManyTaskInputEnvelope
    set?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    disconnect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    delete?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    connect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    update?: TimeEntryUpdateWithWhereUniqueWithoutTaskInput | TimeEntryUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TimeEntryUpdateManyWithWhereWithoutTaskInput | TimeEntryUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TimeEntryScalarWhereInput | TimeEntryScalarWhereInput[]
  }

  export type TaskWatcherUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput> | TaskWatcherCreateWithoutTaskInput[] | TaskWatcherUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskWatcherCreateOrConnectWithoutTaskInput | TaskWatcherCreateOrConnectWithoutTaskInput[]
    upsert?: TaskWatcherUpsertWithWhereUniqueWithoutTaskInput | TaskWatcherUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TaskWatcherCreateManyTaskInputEnvelope
    set?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    disconnect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    delete?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    connect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    update?: TaskWatcherUpdateWithWhereUniqueWithoutTaskInput | TaskWatcherUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TaskWatcherUpdateManyWithWhereWithoutTaskInput | TaskWatcherUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TaskWatcherScalarWhereInput | TaskWatcherScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput> | TaskCreateWithoutParentInput[] | TaskUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutParentInput | TaskCreateOrConnectWithoutParentInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutParentInput | TaskUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TaskCreateManyParentInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutParentInput | TaskUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutParentInput | TaskUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskLabelUncheckedUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput> | TaskLabelCreateWithoutTaskInput[] | TaskLabelUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutTaskInput | TaskLabelCreateOrConnectWithoutTaskInput[]
    upsert?: TaskLabelUpsertWithWhereUniqueWithoutTaskInput | TaskLabelUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TaskLabelCreateManyTaskInputEnvelope
    set?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    disconnect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    delete?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    update?: TaskLabelUpdateWithWhereUniqueWithoutTaskInput | TaskLabelUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TaskLabelUpdateManyWithWhereWithoutTaskInput | TaskLabelUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutTaskNestedInput = {
    create?: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput> | CommentCreateWithoutTaskInput[] | CommentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutTaskInput | CommentCreateOrConnectWithoutTaskInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutTaskInput | CommentUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: CommentCreateManyTaskInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutTaskInput | CommentUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutTaskInput | CommentUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type AttachmentUncheckedUpdateManyWithoutTaskNestedInput = {
    create?: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput> | AttachmentCreateWithoutTaskInput[] | AttachmentUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutTaskInput | AttachmentCreateOrConnectWithoutTaskInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutTaskInput | AttachmentUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: AttachmentCreateManyTaskInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutTaskInput | AttachmentUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutTaskInput | AttachmentUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type TimeEntryUncheckedUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput> | TimeEntryCreateWithoutTaskInput[] | TimeEntryUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TimeEntryCreateOrConnectWithoutTaskInput | TimeEntryCreateOrConnectWithoutTaskInput[]
    upsert?: TimeEntryUpsertWithWhereUniqueWithoutTaskInput | TimeEntryUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TimeEntryCreateManyTaskInputEnvelope
    set?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    disconnect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    delete?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    connect?: TimeEntryWhereUniqueInput | TimeEntryWhereUniqueInput[]
    update?: TimeEntryUpdateWithWhereUniqueWithoutTaskInput | TimeEntryUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TimeEntryUpdateManyWithWhereWithoutTaskInput | TimeEntryUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TimeEntryScalarWhereInput | TimeEntryScalarWhereInput[]
  }

  export type TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput = {
    create?: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput> | TaskWatcherCreateWithoutTaskInput[] | TaskWatcherUncheckedCreateWithoutTaskInput[]
    connectOrCreate?: TaskWatcherCreateOrConnectWithoutTaskInput | TaskWatcherCreateOrConnectWithoutTaskInput[]
    upsert?: TaskWatcherUpsertWithWhereUniqueWithoutTaskInput | TaskWatcherUpsertWithWhereUniqueWithoutTaskInput[]
    createMany?: TaskWatcherCreateManyTaskInputEnvelope
    set?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    disconnect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    delete?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    connect?: TaskWatcherWhereUniqueInput | TaskWatcherWhereUniqueInput[]
    update?: TaskWatcherUpdateWithWhereUniqueWithoutTaskInput | TaskWatcherUpdateWithWhereUniqueWithoutTaskInput[]
    updateMany?: TaskWatcherUpdateManyWithWhereWithoutTaskInput | TaskWatcherUpdateManyWithWhereWithoutTaskInput[]
    deleteMany?: TaskWatcherScalarWhereInput | TaskWatcherScalarWhereInput[]
  }

  export type BoardCreateNestedOneWithoutSprintsInput = {
    create?: XOR<BoardCreateWithoutSprintsInput, BoardUncheckedCreateWithoutSprintsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutSprintsInput
    connect?: BoardWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutSprintInput = {
    create?: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput> | TaskCreateWithoutSprintInput[] | TaskUncheckedCreateWithoutSprintInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutSprintInput | TaskCreateOrConnectWithoutSprintInput[]
    createMany?: TaskCreateManySprintInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutSprintInput = {
    create?: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput> | TaskCreateWithoutSprintInput[] | TaskUncheckedCreateWithoutSprintInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutSprintInput | TaskCreateOrConnectWithoutSprintInput[]
    createMany?: TaskCreateManySprintInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type EnumSprintStatusFieldUpdateOperationsInput = {
    set?: $Enums.SprintStatus
  }

  export type BoardUpdateOneRequiredWithoutSprintsNestedInput = {
    create?: XOR<BoardCreateWithoutSprintsInput, BoardUncheckedCreateWithoutSprintsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutSprintsInput
    upsert?: BoardUpsertWithoutSprintsInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutSprintsInput, BoardUpdateWithoutSprintsInput>, BoardUncheckedUpdateWithoutSprintsInput>
  }

  export type TaskUpdateManyWithoutSprintNestedInput = {
    create?: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput> | TaskCreateWithoutSprintInput[] | TaskUncheckedCreateWithoutSprintInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutSprintInput | TaskCreateOrConnectWithoutSprintInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutSprintInput | TaskUpsertWithWhereUniqueWithoutSprintInput[]
    createMany?: TaskCreateManySprintInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutSprintInput | TaskUpdateWithWhereUniqueWithoutSprintInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutSprintInput | TaskUpdateManyWithWhereWithoutSprintInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutSprintNestedInput = {
    create?: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput> | TaskCreateWithoutSprintInput[] | TaskUncheckedCreateWithoutSprintInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutSprintInput | TaskCreateOrConnectWithoutSprintInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutSprintInput | TaskUpsertWithWhereUniqueWithoutSprintInput[]
    createMany?: TaskCreateManySprintInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutSprintInput | TaskUpdateWithWhereUniqueWithoutSprintInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutSprintInput | TaskUpdateManyWithWhereWithoutSprintInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type BoardCreateNestedOneWithoutEpicsInput = {
    create?: XOR<BoardCreateWithoutEpicsInput, BoardUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutEpicsInput
    connect?: BoardWhereUniqueInput
  }

  export type TaskCreateNestedManyWithoutEpicInput = {
    create?: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput> | TaskCreateWithoutEpicInput[] | TaskUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutEpicInput | TaskCreateOrConnectWithoutEpicInput[]
    createMany?: TaskCreateManyEpicInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type TaskUncheckedCreateNestedManyWithoutEpicInput = {
    create?: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput> | TaskCreateWithoutEpicInput[] | TaskUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutEpicInput | TaskCreateOrConnectWithoutEpicInput[]
    createMany?: TaskCreateManyEpicInputEnvelope
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
  }

  export type BoardUpdateOneRequiredWithoutEpicsNestedInput = {
    create?: XOR<BoardCreateWithoutEpicsInput, BoardUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutEpicsInput
    upsert?: BoardUpsertWithoutEpicsInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutEpicsInput, BoardUpdateWithoutEpicsInput>, BoardUncheckedUpdateWithoutEpicsInput>
  }

  export type TaskUpdateManyWithoutEpicNestedInput = {
    create?: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput> | TaskCreateWithoutEpicInput[] | TaskUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutEpicInput | TaskCreateOrConnectWithoutEpicInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutEpicInput | TaskUpsertWithWhereUniqueWithoutEpicInput[]
    createMany?: TaskCreateManyEpicInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutEpicInput | TaskUpdateWithWhereUniqueWithoutEpicInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutEpicInput | TaskUpdateManyWithWhereWithoutEpicInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type TaskUncheckedUpdateManyWithoutEpicNestedInput = {
    create?: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput> | TaskCreateWithoutEpicInput[] | TaskUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: TaskCreateOrConnectWithoutEpicInput | TaskCreateOrConnectWithoutEpicInput[]
    upsert?: TaskUpsertWithWhereUniqueWithoutEpicInput | TaskUpsertWithWhereUniqueWithoutEpicInput[]
    createMany?: TaskCreateManyEpicInputEnvelope
    set?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    disconnect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    delete?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    connect?: TaskWhereUniqueInput | TaskWhereUniqueInput[]
    update?: TaskUpdateWithWhereUniqueWithoutEpicInput | TaskUpdateWithWhereUniqueWithoutEpicInput[]
    updateMany?: TaskUpdateManyWithWhereWithoutEpicInput | TaskUpdateManyWithWhereWithoutEpicInput[]
    deleteMany?: TaskScalarWhereInput | TaskScalarWhereInput[]
  }

  export type BoardCreateNestedOneWithoutLabelsInput = {
    create?: XOR<BoardCreateWithoutLabelsInput, BoardUncheckedCreateWithoutLabelsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutLabelsInput
    connect?: BoardWhereUniqueInput
  }

  export type TaskLabelCreateNestedManyWithoutLabelInput = {
    create?: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput> | TaskLabelCreateWithoutLabelInput[] | TaskLabelUncheckedCreateWithoutLabelInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutLabelInput | TaskLabelCreateOrConnectWithoutLabelInput[]
    createMany?: TaskLabelCreateManyLabelInputEnvelope
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
  }

  export type TaskLabelUncheckedCreateNestedManyWithoutLabelInput = {
    create?: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput> | TaskLabelCreateWithoutLabelInput[] | TaskLabelUncheckedCreateWithoutLabelInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutLabelInput | TaskLabelCreateOrConnectWithoutLabelInput[]
    createMany?: TaskLabelCreateManyLabelInputEnvelope
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
  }

  export type BoardUpdateOneRequiredWithoutLabelsNestedInput = {
    create?: XOR<BoardCreateWithoutLabelsInput, BoardUncheckedCreateWithoutLabelsInput>
    connectOrCreate?: BoardCreateOrConnectWithoutLabelsInput
    upsert?: BoardUpsertWithoutLabelsInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutLabelsInput, BoardUpdateWithoutLabelsInput>, BoardUncheckedUpdateWithoutLabelsInput>
  }

  export type TaskLabelUpdateManyWithoutLabelNestedInput = {
    create?: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput> | TaskLabelCreateWithoutLabelInput[] | TaskLabelUncheckedCreateWithoutLabelInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutLabelInput | TaskLabelCreateOrConnectWithoutLabelInput[]
    upsert?: TaskLabelUpsertWithWhereUniqueWithoutLabelInput | TaskLabelUpsertWithWhereUniqueWithoutLabelInput[]
    createMany?: TaskLabelCreateManyLabelInputEnvelope
    set?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    disconnect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    delete?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    update?: TaskLabelUpdateWithWhereUniqueWithoutLabelInput | TaskLabelUpdateWithWhereUniqueWithoutLabelInput[]
    updateMany?: TaskLabelUpdateManyWithWhereWithoutLabelInput | TaskLabelUpdateManyWithWhereWithoutLabelInput[]
    deleteMany?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
  }

  export type TaskLabelUncheckedUpdateManyWithoutLabelNestedInput = {
    create?: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput> | TaskLabelCreateWithoutLabelInput[] | TaskLabelUncheckedCreateWithoutLabelInput[]
    connectOrCreate?: TaskLabelCreateOrConnectWithoutLabelInput | TaskLabelCreateOrConnectWithoutLabelInput[]
    upsert?: TaskLabelUpsertWithWhereUniqueWithoutLabelInput | TaskLabelUpsertWithWhereUniqueWithoutLabelInput[]
    createMany?: TaskLabelCreateManyLabelInputEnvelope
    set?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    disconnect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    delete?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    connect?: TaskLabelWhereUniqueInput | TaskLabelWhereUniqueInput[]
    update?: TaskLabelUpdateWithWhereUniqueWithoutLabelInput | TaskLabelUpdateWithWhereUniqueWithoutLabelInput[]
    updateMany?: TaskLabelUpdateManyWithWhereWithoutLabelInput | TaskLabelUpdateManyWithWhereWithoutLabelInput[]
    deleteMany?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
  }

  export type TaskCreateNestedOneWithoutLabelsInput = {
    create?: XOR<TaskCreateWithoutLabelsInput, TaskUncheckedCreateWithoutLabelsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutLabelsInput
    connect?: TaskWhereUniqueInput
  }

  export type LabelCreateNestedOneWithoutTasksInput = {
    create?: XOR<LabelCreateWithoutTasksInput, LabelUncheckedCreateWithoutTasksInput>
    connectOrCreate?: LabelCreateOrConnectWithoutTasksInput
    connect?: LabelWhereUniqueInput
  }

  export type TaskUpdateOneRequiredWithoutLabelsNestedInput = {
    create?: XOR<TaskCreateWithoutLabelsInput, TaskUncheckedCreateWithoutLabelsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutLabelsInput
    upsert?: TaskUpsertWithoutLabelsInput
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutLabelsInput, TaskUpdateWithoutLabelsInput>, TaskUncheckedUpdateWithoutLabelsInput>
  }

  export type LabelUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<LabelCreateWithoutTasksInput, LabelUncheckedCreateWithoutTasksInput>
    connectOrCreate?: LabelCreateOrConnectWithoutTasksInput
    upsert?: LabelUpsertWithoutTasksInput
    connect?: LabelWhereUniqueInput
    update?: XOR<XOR<LabelUpdateToOneWithWhereWithoutTasksInput, LabelUpdateWithoutTasksInput>, LabelUncheckedUpdateWithoutTasksInput>
  }

  export type CommentCreatementionsInput = {
    set: string[]
  }

  export type TaskCreateNestedOneWithoutCommentsInput = {
    create?: XOR<TaskCreateWithoutCommentsInput, TaskUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutCommentsInput
    connect?: TaskWhereUniqueInput
  }

  export type CommentUpdatementionsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TaskUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<TaskCreateWithoutCommentsInput, TaskUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutCommentsInput
    upsert?: TaskUpsertWithoutCommentsInput
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutCommentsInput, TaskUpdateWithoutCommentsInput>, TaskUncheckedUpdateWithoutCommentsInput>
  }

  export type TaskCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<TaskCreateWithoutAttachmentsInput, TaskUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutAttachmentsInput
    connect?: TaskWhereUniqueInput
  }

  export type TaskUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<TaskCreateWithoutAttachmentsInput, TaskUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: TaskCreateOrConnectWithoutAttachmentsInput
    upsert?: TaskUpsertWithoutAttachmentsInput
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutAttachmentsInput, TaskUpdateWithoutAttachmentsInput>, TaskUncheckedUpdateWithoutAttachmentsInput>
  }

  export type TaskCreateNestedOneWithoutTimeEntriesInput = {
    create?: XOR<TaskCreateWithoutTimeEntriesInput, TaskUncheckedCreateWithoutTimeEntriesInput>
    connectOrCreate?: TaskCreateOrConnectWithoutTimeEntriesInput
    connect?: TaskWhereUniqueInput
  }

  export type TaskUpdateOneRequiredWithoutTimeEntriesNestedInput = {
    create?: XOR<TaskCreateWithoutTimeEntriesInput, TaskUncheckedCreateWithoutTimeEntriesInput>
    connectOrCreate?: TaskCreateOrConnectWithoutTimeEntriesInput
    upsert?: TaskUpsertWithoutTimeEntriesInput
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutTimeEntriesInput, TaskUpdateWithoutTimeEntriesInput>, TaskUncheckedUpdateWithoutTimeEntriesInput>
  }

  export type TaskCreateNestedOneWithoutWatchersInput = {
    create?: XOR<TaskCreateWithoutWatchersInput, TaskUncheckedCreateWithoutWatchersInput>
    connectOrCreate?: TaskCreateOrConnectWithoutWatchersInput
    connect?: TaskWhereUniqueInput
  }

  export type TaskUpdateOneRequiredWithoutWatchersNestedInput = {
    create?: XOR<TaskCreateWithoutWatchersInput, TaskUncheckedCreateWithoutWatchersInput>
    connectOrCreate?: TaskCreateOrConnectWithoutWatchersInput
    upsert?: TaskUpsertWithoutWatchersInput
    connect?: TaskWhereUniqueInput
    update?: XOR<XOR<TaskUpdateToOneWithWhereWithoutWatchersInput, TaskUpdateWithoutWatchersInput>, TaskUncheckedUpdateWithoutWatchersInput>
  }

  export type BoardCreateNestedOneWithoutActivityInput = {
    create?: XOR<BoardCreateWithoutActivityInput, BoardUncheckedCreateWithoutActivityInput>
    connectOrCreate?: BoardCreateOrConnectWithoutActivityInput
    connect?: BoardWhereUniqueInput
  }

  export type BoardUpdateOneRequiredWithoutActivityNestedInput = {
    create?: XOR<BoardCreateWithoutActivityInput, BoardUncheckedCreateWithoutActivityInput>
    connectOrCreate?: BoardCreateOrConnectWithoutActivityInput
    upsert?: BoardUpsertWithoutActivityInput
    connect?: BoardWhereUniqueInput
    update?: XOR<XOR<BoardUpdateToOneWithWhereWithoutActivityInput, BoardUpdateWithoutActivityInput>, BoardUncheckedUpdateWithoutActivityInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumBoardVisibilityFilter<$PrismaModel = never> = {
    equals?: $Enums.BoardVisibility | EnumBoardVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumBoardVisibilityFilter<$PrismaModel> | $Enums.BoardVisibility
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumBoardVisibilityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BoardVisibility | EnumBoardVisibilityFieldRefInput<$PrismaModel>
    in?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    notIn?: $Enums.BoardVisibility[] | ListEnumBoardVisibilityFieldRefInput<$PrismaModel>
    not?: NestedEnumBoardVisibilityWithAggregatesFilter<$PrismaModel> | $Enums.BoardVisibility
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBoardVisibilityFilter<$PrismaModel>
    _max?: NestedEnumBoardVisibilityFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumTaskStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskStatus | EnumTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskStatusFilter<$PrismaModel> | $Enums.TaskStatus
  }

  export type NestedEnumTaskStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskStatus | EnumTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskStatus[] | ListEnumTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskStatusWithAggregatesFilter<$PrismaModel> | $Enums.TaskStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaskStatusFilter<$PrismaModel>
    _max?: NestedEnumTaskStatusFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumTaskTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskType | EnumTaskTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskTypeFilter<$PrismaModel> | $Enums.TaskType
  }

  export type NestedEnumPriorityFilter<$PrismaModel = never> = {
    equals?: $Enums.Priority | EnumPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityFilter<$PrismaModel> | $Enums.Priority
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumTaskTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TaskType | EnumTaskTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TaskType[] | ListEnumTaskTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTaskTypeWithAggregatesFilter<$PrismaModel> | $Enums.TaskType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTaskTypeFilter<$PrismaModel>
    _max?: NestedEnumTaskTypeFilter<$PrismaModel>
  }

  export type NestedEnumPriorityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Priority | EnumPriorityFieldRefInput<$PrismaModel>
    in?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Priority[] | ListEnumPriorityFieldRefInput<$PrismaModel>
    not?: NestedEnumPriorityWithAggregatesFilter<$PrismaModel> | $Enums.Priority
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriorityFilter<$PrismaModel>
    _max?: NestedEnumPriorityFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumSprintStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SprintStatus | EnumSprintStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSprintStatusFilter<$PrismaModel> | $Enums.SprintStatus
  }

  export type NestedEnumSprintStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SprintStatus | EnumSprintStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SprintStatus[] | ListEnumSprintStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSprintStatusWithAggregatesFilter<$PrismaModel> | $Enums.SprintStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSprintStatusFilter<$PrismaModel>
    _max?: NestedEnumSprintStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ColumnCreateWithoutBoardInput = {
    id?: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutColumnInput
  }

  export type ColumnUncheckedCreateWithoutBoardInput = {
    id?: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutColumnInput
  }

  export type ColumnCreateOrConnectWithoutBoardInput = {
    where: ColumnWhereUniqueInput
    create: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput>
  }

  export type ColumnCreateManyBoardInputEnvelope = {
    data: ColumnCreateManyBoardInput | ColumnCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type TaskCreateWithoutBoardInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutBoardInput = {
    id?: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutBoardInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput>
  }

  export type TaskCreateManyBoardInputEnvelope = {
    data: TaskCreateManyBoardInput | TaskCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type SprintCreateWithoutBoardInput = {
    id?: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutSprintInput
  }

  export type SprintUncheckedCreateWithoutBoardInput = {
    id?: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutSprintInput
  }

  export type SprintCreateOrConnectWithoutBoardInput = {
    where: SprintWhereUniqueInput
    create: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput>
  }

  export type SprintCreateManyBoardInputEnvelope = {
    data: SprintCreateManyBoardInput | SprintCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type EpicCreateWithoutBoardInput = {
    id?: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutEpicInput
  }

  export type EpicUncheckedCreateWithoutBoardInput = {
    id?: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutEpicInput
  }

  export type EpicCreateOrConnectWithoutBoardInput = {
    where: EpicWhereUniqueInput
    create: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput>
  }

  export type EpicCreateManyBoardInputEnvelope = {
    data: EpicCreateManyBoardInput | EpicCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type LabelCreateWithoutBoardInput = {
    id?: string
    name: string
    color: string
    createdAt?: Date | string
    tasks?: TaskLabelCreateNestedManyWithoutLabelInput
  }

  export type LabelUncheckedCreateWithoutBoardInput = {
    id?: string
    name: string
    color: string
    createdAt?: Date | string
    tasks?: TaskLabelUncheckedCreateNestedManyWithoutLabelInput
  }

  export type LabelCreateOrConnectWithoutBoardInput = {
    where: LabelWhereUniqueInput
    create: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput>
  }

  export type LabelCreateManyBoardInputEnvelope = {
    data: LabelCreateManyBoardInput | LabelCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type ActivityCreateWithoutBoardInput = {
    id?: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityUncheckedCreateWithoutBoardInput = {
    id?: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityCreateOrConnectWithoutBoardInput = {
    where: ActivityWhereUniqueInput
    create: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput>
  }

  export type ActivityCreateManyBoardInputEnvelope = {
    data: ActivityCreateManyBoardInput | ActivityCreateManyBoardInput[]
    skipDuplicates?: boolean
  }

  export type ColumnUpsertWithWhereUniqueWithoutBoardInput = {
    where: ColumnWhereUniqueInput
    update: XOR<ColumnUpdateWithoutBoardInput, ColumnUncheckedUpdateWithoutBoardInput>
    create: XOR<ColumnCreateWithoutBoardInput, ColumnUncheckedCreateWithoutBoardInput>
  }

  export type ColumnUpdateWithWhereUniqueWithoutBoardInput = {
    where: ColumnWhereUniqueInput
    data: XOR<ColumnUpdateWithoutBoardInput, ColumnUncheckedUpdateWithoutBoardInput>
  }

  export type ColumnUpdateManyWithWhereWithoutBoardInput = {
    where: ColumnScalarWhereInput
    data: XOR<ColumnUpdateManyMutationInput, ColumnUncheckedUpdateManyWithoutBoardInput>
  }

  export type ColumnScalarWhereInput = {
    AND?: ColumnScalarWhereInput | ColumnScalarWhereInput[]
    OR?: ColumnScalarWhereInput[]
    NOT?: ColumnScalarWhereInput | ColumnScalarWhereInput[]
    id?: StringFilter<"Column"> | string
    boardId?: StringFilter<"Column"> | string
    name?: StringFilter<"Column"> | string
    color?: StringFilter<"Column"> | string
    status?: EnumTaskStatusFilter<"Column"> | $Enums.TaskStatus
    order?: FloatFilter<"Column"> | number
    wipLimit?: IntNullableFilter<"Column"> | number | null
    createdAt?: DateTimeFilter<"Column"> | Date | string
  }

  export type TaskUpsertWithWhereUniqueWithoutBoardInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutBoardInput, TaskUncheckedUpdateWithoutBoardInput>
    create: XOR<TaskCreateWithoutBoardInput, TaskUncheckedCreateWithoutBoardInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutBoardInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutBoardInput, TaskUncheckedUpdateWithoutBoardInput>
  }

  export type TaskUpdateManyWithWhereWithoutBoardInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutBoardInput>
  }

  export type TaskScalarWhereInput = {
    AND?: TaskScalarWhereInput | TaskScalarWhereInput[]
    OR?: TaskScalarWhereInput[]
    NOT?: TaskScalarWhereInput | TaskScalarWhereInput[]
    id?: StringFilter<"Task"> | string
    boardId?: StringFilter<"Task"> | string
    columnId?: StringFilter<"Task"> | string
    sprintId?: StringNullableFilter<"Task"> | string | null
    epicId?: StringNullableFilter<"Task"> | string | null
    parentId?: StringNullableFilter<"Task"> | string | null
    number?: IntFilter<"Task"> | number
    key?: StringFilter<"Task"> | string
    title?: StringFilter<"Task"> | string
    description?: StringNullableFilter<"Task"> | string | null
    type?: EnumTaskTypeFilter<"Task"> | $Enums.TaskType
    priority?: EnumPriorityFilter<"Task"> | $Enums.Priority
    status?: EnumTaskStatusFilter<"Task"> | $Enums.TaskStatus
    points?: IntNullableFilter<"Task"> | number | null
    estimatedHours?: FloatNullableFilter<"Task"> | number | null
    order?: FloatFilter<"Task"> | number
    dueDate?: DateTimeNullableFilter<"Task"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Task"> | Date | string | null
    assigneeId?: StringNullableFilter<"Task"> | string | null
    reporterId?: StringFilter<"Task"> | string
    createdAt?: DateTimeFilter<"Task"> | Date | string
    updatedAt?: DateTimeFilter<"Task"> | Date | string
  }

  export type SprintUpsertWithWhereUniqueWithoutBoardInput = {
    where: SprintWhereUniqueInput
    update: XOR<SprintUpdateWithoutBoardInput, SprintUncheckedUpdateWithoutBoardInput>
    create: XOR<SprintCreateWithoutBoardInput, SprintUncheckedCreateWithoutBoardInput>
  }

  export type SprintUpdateWithWhereUniqueWithoutBoardInput = {
    where: SprintWhereUniqueInput
    data: XOR<SprintUpdateWithoutBoardInput, SprintUncheckedUpdateWithoutBoardInput>
  }

  export type SprintUpdateManyWithWhereWithoutBoardInput = {
    where: SprintScalarWhereInput
    data: XOR<SprintUpdateManyMutationInput, SprintUncheckedUpdateManyWithoutBoardInput>
  }

  export type SprintScalarWhereInput = {
    AND?: SprintScalarWhereInput | SprintScalarWhereInput[]
    OR?: SprintScalarWhereInput[]
    NOT?: SprintScalarWhereInput | SprintScalarWhereInput[]
    id?: StringFilter<"Sprint"> | string
    boardId?: StringFilter<"Sprint"> | string
    name?: StringFilter<"Sprint"> | string
    goal?: StringNullableFilter<"Sprint"> | string | null
    startDate?: DateTimeFilter<"Sprint"> | Date | string
    endDate?: DateTimeFilter<"Sprint"> | Date | string
    status?: EnumSprintStatusFilter<"Sprint"> | $Enums.SprintStatus
    committedPoints?: IntNullableFilter<"Sprint"> | number | null
    completedPoints?: IntNullableFilter<"Sprint"> | number | null
    startedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"Sprint"> | Date | string | null
    createdAt?: DateTimeFilter<"Sprint"> | Date | string
  }

  export type EpicUpsertWithWhereUniqueWithoutBoardInput = {
    where: EpicWhereUniqueInput
    update: XOR<EpicUpdateWithoutBoardInput, EpicUncheckedUpdateWithoutBoardInput>
    create: XOR<EpicCreateWithoutBoardInput, EpicUncheckedCreateWithoutBoardInput>
  }

  export type EpicUpdateWithWhereUniqueWithoutBoardInput = {
    where: EpicWhereUniqueInput
    data: XOR<EpicUpdateWithoutBoardInput, EpicUncheckedUpdateWithoutBoardInput>
  }

  export type EpicUpdateManyWithWhereWithoutBoardInput = {
    where: EpicScalarWhereInput
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyWithoutBoardInput>
  }

  export type EpicScalarWhereInput = {
    AND?: EpicScalarWhereInput | EpicScalarWhereInput[]
    OR?: EpicScalarWhereInput[]
    NOT?: EpicScalarWhereInput | EpicScalarWhereInput[]
    id?: StringFilter<"Epic"> | string
    boardId?: StringFilter<"Epic"> | string
    name?: StringFilter<"Epic"> | string
    description?: StringNullableFilter<"Epic"> | string | null
    color?: StringFilter<"Epic"> | string
    createdAt?: DateTimeFilter<"Epic"> | Date | string
  }

  export type LabelUpsertWithWhereUniqueWithoutBoardInput = {
    where: LabelWhereUniqueInput
    update: XOR<LabelUpdateWithoutBoardInput, LabelUncheckedUpdateWithoutBoardInput>
    create: XOR<LabelCreateWithoutBoardInput, LabelUncheckedCreateWithoutBoardInput>
  }

  export type LabelUpdateWithWhereUniqueWithoutBoardInput = {
    where: LabelWhereUniqueInput
    data: XOR<LabelUpdateWithoutBoardInput, LabelUncheckedUpdateWithoutBoardInput>
  }

  export type LabelUpdateManyWithWhereWithoutBoardInput = {
    where: LabelScalarWhereInput
    data: XOR<LabelUpdateManyMutationInput, LabelUncheckedUpdateManyWithoutBoardInput>
  }

  export type LabelScalarWhereInput = {
    AND?: LabelScalarWhereInput | LabelScalarWhereInput[]
    OR?: LabelScalarWhereInput[]
    NOT?: LabelScalarWhereInput | LabelScalarWhereInput[]
    id?: StringFilter<"Label"> | string
    boardId?: StringFilter<"Label"> | string
    name?: StringFilter<"Label"> | string
    color?: StringFilter<"Label"> | string
    createdAt?: DateTimeFilter<"Label"> | Date | string
  }

  export type ActivityUpsertWithWhereUniqueWithoutBoardInput = {
    where: ActivityWhereUniqueInput
    update: XOR<ActivityUpdateWithoutBoardInput, ActivityUncheckedUpdateWithoutBoardInput>
    create: XOR<ActivityCreateWithoutBoardInput, ActivityUncheckedCreateWithoutBoardInput>
  }

  export type ActivityUpdateWithWhereUniqueWithoutBoardInput = {
    where: ActivityWhereUniqueInput
    data: XOR<ActivityUpdateWithoutBoardInput, ActivityUncheckedUpdateWithoutBoardInput>
  }

  export type ActivityUpdateManyWithWhereWithoutBoardInput = {
    where: ActivityScalarWhereInput
    data: XOR<ActivityUpdateManyMutationInput, ActivityUncheckedUpdateManyWithoutBoardInput>
  }

  export type ActivityScalarWhereInput = {
    AND?: ActivityScalarWhereInput | ActivityScalarWhereInput[]
    OR?: ActivityScalarWhereInput[]
    NOT?: ActivityScalarWhereInput | ActivityScalarWhereInput[]
    id?: StringFilter<"Activity"> | string
    boardId?: StringFilter<"Activity"> | string
    taskId?: StringNullableFilter<"Activity"> | string | null
    userId?: StringFilter<"Activity"> | string
    action?: StringFilter<"Activity"> | string
    detail?: JsonFilter<"Activity">
    createdAt?: DateTimeFilter<"Activity"> | Date | string
  }

  export type BoardCreateWithoutColumnsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutColumnsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutColumnsInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutColumnsInput, BoardUncheckedCreateWithoutColumnsInput>
  }

  export type TaskCreateWithoutColumnInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutColumnInput = {
    id?: string
    boardId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutColumnInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput>
  }

  export type TaskCreateManyColumnInputEnvelope = {
    data: TaskCreateManyColumnInput | TaskCreateManyColumnInput[]
    skipDuplicates?: boolean
  }

  export type BoardUpsertWithoutColumnsInput = {
    update: XOR<BoardUpdateWithoutColumnsInput, BoardUncheckedUpdateWithoutColumnsInput>
    create: XOR<BoardCreateWithoutColumnsInput, BoardUncheckedCreateWithoutColumnsInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutColumnsInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutColumnsInput, BoardUncheckedUpdateWithoutColumnsInput>
  }

  export type BoardUpdateWithoutColumnsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutColumnsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type TaskUpsertWithWhereUniqueWithoutColumnInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutColumnInput, TaskUncheckedUpdateWithoutColumnInput>
    create: XOR<TaskCreateWithoutColumnInput, TaskUncheckedCreateWithoutColumnInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutColumnInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutColumnInput, TaskUncheckedUpdateWithoutColumnInput>
  }

  export type TaskUpdateManyWithWhereWithoutColumnInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutColumnInput>
  }

  export type BoardCreateWithoutTasksInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutTasksInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutTasksInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutTasksInput, BoardUncheckedCreateWithoutTasksInput>
  }

  export type ColumnCreateWithoutTasksInput = {
    id?: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutColumnsInput
  }

  export type ColumnUncheckedCreateWithoutTasksInput = {
    id?: string
    boardId: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
  }

  export type ColumnCreateOrConnectWithoutTasksInput = {
    where: ColumnWhereUniqueInput
    create: XOR<ColumnCreateWithoutTasksInput, ColumnUncheckedCreateWithoutTasksInput>
  }

  export type SprintCreateWithoutTasksInput = {
    id?: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutSprintsInput
  }

  export type SprintUncheckedCreateWithoutTasksInput = {
    id?: string
    boardId: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type SprintCreateOrConnectWithoutTasksInput = {
    where: SprintWhereUniqueInput
    create: XOR<SprintCreateWithoutTasksInput, SprintUncheckedCreateWithoutTasksInput>
  }

  export type EpicCreateWithoutTasksInput = {
    id?: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutEpicsInput
  }

  export type EpicUncheckedCreateWithoutTasksInput = {
    id?: string
    boardId: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
  }

  export type EpicCreateOrConnectWithoutTasksInput = {
    where: EpicWhereUniqueInput
    create: XOR<EpicCreateWithoutTasksInput, EpicUncheckedCreateWithoutTasksInput>
  }

  export type TaskCreateWithoutSubtasksInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutSubtasksInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutSubtasksInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutSubtasksInput, TaskUncheckedCreateWithoutSubtasksInput>
  }

  export type TaskCreateWithoutParentInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutParentInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutParentInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput>
  }

  export type TaskCreateManyParentInputEnvelope = {
    data: TaskCreateManyParentInput | TaskCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type TaskLabelCreateWithoutTaskInput = {
    label: LabelCreateNestedOneWithoutTasksInput
  }

  export type TaskLabelUncheckedCreateWithoutTaskInput = {
    labelId: string
  }

  export type TaskLabelCreateOrConnectWithoutTaskInput = {
    where: TaskLabelWhereUniqueInput
    create: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput>
  }

  export type TaskLabelCreateManyTaskInputEnvelope = {
    data: TaskLabelCreateManyTaskInput | TaskLabelCreateManyTaskInput[]
    skipDuplicates?: boolean
  }

  export type CommentCreateWithoutTaskInput = {
    id?: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentUncheckedCreateWithoutTaskInput = {
    id?: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CommentCreateOrConnectWithoutTaskInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput>
  }

  export type CommentCreateManyTaskInputEnvelope = {
    data: CommentCreateManyTaskInput | CommentCreateManyTaskInput[]
    skipDuplicates?: boolean
  }

  export type AttachmentCreateWithoutTaskInput = {
    id?: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
  }

  export type AttachmentUncheckedCreateWithoutTaskInput = {
    id?: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
  }

  export type AttachmentCreateOrConnectWithoutTaskInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput>
  }

  export type AttachmentCreateManyTaskInputEnvelope = {
    data: AttachmentCreateManyTaskInput | AttachmentCreateManyTaskInput[]
    skipDuplicates?: boolean
  }

  export type TimeEntryCreateWithoutTaskInput = {
    id?: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
  }

  export type TimeEntryUncheckedCreateWithoutTaskInput = {
    id?: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
  }

  export type TimeEntryCreateOrConnectWithoutTaskInput = {
    where: TimeEntryWhereUniqueInput
    create: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput>
  }

  export type TimeEntryCreateManyTaskInputEnvelope = {
    data: TimeEntryCreateManyTaskInput | TimeEntryCreateManyTaskInput[]
    skipDuplicates?: boolean
  }

  export type TaskWatcherCreateWithoutTaskInput = {
    userId: string
  }

  export type TaskWatcherUncheckedCreateWithoutTaskInput = {
    userId: string
  }

  export type TaskWatcherCreateOrConnectWithoutTaskInput = {
    where: TaskWatcherWhereUniqueInput
    create: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput>
  }

  export type TaskWatcherCreateManyTaskInputEnvelope = {
    data: TaskWatcherCreateManyTaskInput | TaskWatcherCreateManyTaskInput[]
    skipDuplicates?: boolean
  }

  export type BoardUpsertWithoutTasksInput = {
    update: XOR<BoardUpdateWithoutTasksInput, BoardUncheckedUpdateWithoutTasksInput>
    create: XOR<BoardCreateWithoutTasksInput, BoardUncheckedCreateWithoutTasksInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutTasksInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutTasksInput, BoardUncheckedUpdateWithoutTasksInput>
  }

  export type BoardUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type ColumnUpsertWithoutTasksInput = {
    update: XOR<ColumnUpdateWithoutTasksInput, ColumnUncheckedUpdateWithoutTasksInput>
    create: XOR<ColumnCreateWithoutTasksInput, ColumnUncheckedCreateWithoutTasksInput>
    where?: ColumnWhereInput
  }

  export type ColumnUpdateToOneWithWhereWithoutTasksInput = {
    where?: ColumnWhereInput
    data: XOR<ColumnUpdateWithoutTasksInput, ColumnUncheckedUpdateWithoutTasksInput>
  }

  export type ColumnUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutColumnsNestedInput
  }

  export type ColumnUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SprintUpsertWithoutTasksInput = {
    update: XOR<SprintUpdateWithoutTasksInput, SprintUncheckedUpdateWithoutTasksInput>
    create: XOR<SprintCreateWithoutTasksInput, SprintUncheckedCreateWithoutTasksInput>
    where?: SprintWhereInput
  }

  export type SprintUpdateToOneWithWhereWithoutTasksInput = {
    where?: SprintWhereInput
    data: XOR<SprintUpdateWithoutTasksInput, SprintUncheckedUpdateWithoutTasksInput>
  }

  export type SprintUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutSprintsNestedInput
  }

  export type SprintUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicUpsertWithoutTasksInput = {
    update: XOR<EpicUpdateWithoutTasksInput, EpicUncheckedUpdateWithoutTasksInput>
    create: XOR<EpicCreateWithoutTasksInput, EpicUncheckedCreateWithoutTasksInput>
    where?: EpicWhereInput
  }

  export type EpicUpdateToOneWithWhereWithoutTasksInput = {
    where?: EpicWhereInput
    data: XOR<EpicUpdateWithoutTasksInput, EpicUncheckedUpdateWithoutTasksInput>
  }

  export type EpicUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutEpicsNestedInput
  }

  export type EpicUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpsertWithoutSubtasksInput = {
    update: XOR<TaskUpdateWithoutSubtasksInput, TaskUncheckedUpdateWithoutSubtasksInput>
    create: XOR<TaskCreateWithoutSubtasksInput, TaskUncheckedCreateWithoutSubtasksInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutSubtasksInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutSubtasksInput, TaskUncheckedUpdateWithoutSubtasksInput>
  }

  export type TaskUpdateWithoutSubtasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutSubtasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUpsertWithWhereUniqueWithoutParentInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutParentInput, TaskUncheckedUpdateWithoutParentInput>
    create: XOR<TaskCreateWithoutParentInput, TaskUncheckedCreateWithoutParentInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutParentInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutParentInput, TaskUncheckedUpdateWithoutParentInput>
  }

  export type TaskUpdateManyWithWhereWithoutParentInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutParentInput>
  }

  export type TaskLabelUpsertWithWhereUniqueWithoutTaskInput = {
    where: TaskLabelWhereUniqueInput
    update: XOR<TaskLabelUpdateWithoutTaskInput, TaskLabelUncheckedUpdateWithoutTaskInput>
    create: XOR<TaskLabelCreateWithoutTaskInput, TaskLabelUncheckedCreateWithoutTaskInput>
  }

  export type TaskLabelUpdateWithWhereUniqueWithoutTaskInput = {
    where: TaskLabelWhereUniqueInput
    data: XOR<TaskLabelUpdateWithoutTaskInput, TaskLabelUncheckedUpdateWithoutTaskInput>
  }

  export type TaskLabelUpdateManyWithWhereWithoutTaskInput = {
    where: TaskLabelScalarWhereInput
    data: XOR<TaskLabelUpdateManyMutationInput, TaskLabelUncheckedUpdateManyWithoutTaskInput>
  }

  export type TaskLabelScalarWhereInput = {
    AND?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
    OR?: TaskLabelScalarWhereInput[]
    NOT?: TaskLabelScalarWhereInput | TaskLabelScalarWhereInput[]
    taskId?: StringFilter<"TaskLabel"> | string
    labelId?: StringFilter<"TaskLabel"> | string
  }

  export type CommentUpsertWithWhereUniqueWithoutTaskInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutTaskInput, CommentUncheckedUpdateWithoutTaskInput>
    create: XOR<CommentCreateWithoutTaskInput, CommentUncheckedCreateWithoutTaskInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutTaskInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutTaskInput, CommentUncheckedUpdateWithoutTaskInput>
  }

  export type CommentUpdateManyWithWhereWithoutTaskInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutTaskInput>
  }

  export type CommentScalarWhereInput = {
    AND?: CommentScalarWhereInput | CommentScalarWhereInput[]
    OR?: CommentScalarWhereInput[]
    NOT?: CommentScalarWhereInput | CommentScalarWhereInput[]
    id?: StringFilter<"Comment"> | string
    taskId?: StringFilter<"Comment"> | string
    userId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    mentions?: StringNullableListFilter<"Comment">
    edited?: BoolFilter<"Comment"> | boolean
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
  }

  export type AttachmentUpsertWithWhereUniqueWithoutTaskInput = {
    where: AttachmentWhereUniqueInput
    update: XOR<AttachmentUpdateWithoutTaskInput, AttachmentUncheckedUpdateWithoutTaskInput>
    create: XOR<AttachmentCreateWithoutTaskInput, AttachmentUncheckedCreateWithoutTaskInput>
  }

  export type AttachmentUpdateWithWhereUniqueWithoutTaskInput = {
    where: AttachmentWhereUniqueInput
    data: XOR<AttachmentUpdateWithoutTaskInput, AttachmentUncheckedUpdateWithoutTaskInput>
  }

  export type AttachmentUpdateManyWithWhereWithoutTaskInput = {
    where: AttachmentScalarWhereInput
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyWithoutTaskInput>
  }

  export type AttachmentScalarWhereInput = {
    AND?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    OR?: AttachmentScalarWhereInput[]
    NOT?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    id?: StringFilter<"Attachment"> | string
    taskId?: StringFilter<"Attachment"> | string
    fileId?: StringFilter<"Attachment"> | string
    name?: StringFilter<"Attachment"> | string
    mimeType?: StringFilter<"Attachment"> | string
    size?: IntFilter<"Attachment"> | number
    addedBy?: StringFilter<"Attachment"> | string
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
  }

  export type TimeEntryUpsertWithWhereUniqueWithoutTaskInput = {
    where: TimeEntryWhereUniqueInput
    update: XOR<TimeEntryUpdateWithoutTaskInput, TimeEntryUncheckedUpdateWithoutTaskInput>
    create: XOR<TimeEntryCreateWithoutTaskInput, TimeEntryUncheckedCreateWithoutTaskInput>
  }

  export type TimeEntryUpdateWithWhereUniqueWithoutTaskInput = {
    where: TimeEntryWhereUniqueInput
    data: XOR<TimeEntryUpdateWithoutTaskInput, TimeEntryUncheckedUpdateWithoutTaskInput>
  }

  export type TimeEntryUpdateManyWithWhereWithoutTaskInput = {
    where: TimeEntryScalarWhereInput
    data: XOR<TimeEntryUpdateManyMutationInput, TimeEntryUncheckedUpdateManyWithoutTaskInput>
  }

  export type TimeEntryScalarWhereInput = {
    AND?: TimeEntryScalarWhereInput | TimeEntryScalarWhereInput[]
    OR?: TimeEntryScalarWhereInput[]
    NOT?: TimeEntryScalarWhereInput | TimeEntryScalarWhereInput[]
    id?: StringFilter<"TimeEntry"> | string
    taskId?: StringFilter<"TimeEntry"> | string
    userId?: StringFilter<"TimeEntry"> | string
    hours?: FloatFilter<"TimeEntry"> | number
    description?: StringNullableFilter<"TimeEntry"> | string | null
    date?: DateTimeFilter<"TimeEntry"> | Date | string
    createdAt?: DateTimeFilter<"TimeEntry"> | Date | string
  }

  export type TaskWatcherUpsertWithWhereUniqueWithoutTaskInput = {
    where: TaskWatcherWhereUniqueInput
    update: XOR<TaskWatcherUpdateWithoutTaskInput, TaskWatcherUncheckedUpdateWithoutTaskInput>
    create: XOR<TaskWatcherCreateWithoutTaskInput, TaskWatcherUncheckedCreateWithoutTaskInput>
  }

  export type TaskWatcherUpdateWithWhereUniqueWithoutTaskInput = {
    where: TaskWatcherWhereUniqueInput
    data: XOR<TaskWatcherUpdateWithoutTaskInput, TaskWatcherUncheckedUpdateWithoutTaskInput>
  }

  export type TaskWatcherUpdateManyWithWhereWithoutTaskInput = {
    where: TaskWatcherScalarWhereInput
    data: XOR<TaskWatcherUpdateManyMutationInput, TaskWatcherUncheckedUpdateManyWithoutTaskInput>
  }

  export type TaskWatcherScalarWhereInput = {
    AND?: TaskWatcherScalarWhereInput | TaskWatcherScalarWhereInput[]
    OR?: TaskWatcherScalarWhereInput[]
    NOT?: TaskWatcherScalarWhereInput | TaskWatcherScalarWhereInput[]
    taskId?: StringFilter<"TaskWatcher"> | string
    userId?: StringFilter<"TaskWatcher"> | string
  }

  export type BoardCreateWithoutSprintsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    tasks?: TaskCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutSprintsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutSprintsInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutSprintsInput, BoardUncheckedCreateWithoutSprintsInput>
  }

  export type TaskCreateWithoutSprintInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutSprintInput = {
    id?: string
    boardId: string
    columnId: string
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutSprintInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput>
  }

  export type TaskCreateManySprintInputEnvelope = {
    data: TaskCreateManySprintInput | TaskCreateManySprintInput[]
    skipDuplicates?: boolean
  }

  export type BoardUpsertWithoutSprintsInput = {
    update: XOR<BoardUpdateWithoutSprintsInput, BoardUncheckedUpdateWithoutSprintsInput>
    create: XOR<BoardCreateWithoutSprintsInput, BoardUncheckedCreateWithoutSprintsInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutSprintsInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutSprintsInput, BoardUncheckedUpdateWithoutSprintsInput>
  }

  export type BoardUpdateWithoutSprintsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutSprintsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type TaskUpsertWithWhereUniqueWithoutSprintInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutSprintInput, TaskUncheckedUpdateWithoutSprintInput>
    create: XOR<TaskCreateWithoutSprintInput, TaskUncheckedCreateWithoutSprintInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutSprintInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutSprintInput, TaskUncheckedUpdateWithoutSprintInput>
  }

  export type TaskUpdateManyWithWhereWithoutSprintInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutSprintInput>
  }

  export type BoardCreateWithoutEpicsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    tasks?: TaskCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutEpicsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutEpicsInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutEpicsInput, BoardUncheckedCreateWithoutEpicsInput>
  }

  export type TaskCreateWithoutEpicInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutEpicInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutEpicInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput>
  }

  export type TaskCreateManyEpicInputEnvelope = {
    data: TaskCreateManyEpicInput | TaskCreateManyEpicInput[]
    skipDuplicates?: boolean
  }

  export type BoardUpsertWithoutEpicsInput = {
    update: XOR<BoardUpdateWithoutEpicsInput, BoardUncheckedUpdateWithoutEpicsInput>
    create: XOR<BoardCreateWithoutEpicsInput, BoardUncheckedCreateWithoutEpicsInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutEpicsInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutEpicsInput, BoardUncheckedUpdateWithoutEpicsInput>
  }

  export type BoardUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type TaskUpsertWithWhereUniqueWithoutEpicInput = {
    where: TaskWhereUniqueInput
    update: XOR<TaskUpdateWithoutEpicInput, TaskUncheckedUpdateWithoutEpicInput>
    create: XOR<TaskCreateWithoutEpicInput, TaskUncheckedCreateWithoutEpicInput>
  }

  export type TaskUpdateWithWhereUniqueWithoutEpicInput = {
    where: TaskWhereUniqueInput
    data: XOR<TaskUpdateWithoutEpicInput, TaskUncheckedUpdateWithoutEpicInput>
  }

  export type TaskUpdateManyWithWhereWithoutEpicInput = {
    where: TaskScalarWhereInput
    data: XOR<TaskUpdateManyMutationInput, TaskUncheckedUpdateManyWithoutEpicInput>
  }

  export type BoardCreateWithoutLabelsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    tasks?: TaskCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    activity?: ActivityCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutLabelsInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    activity?: ActivityUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutLabelsInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutLabelsInput, BoardUncheckedCreateWithoutLabelsInput>
  }

  export type TaskLabelCreateWithoutLabelInput = {
    task: TaskCreateNestedOneWithoutLabelsInput
  }

  export type TaskLabelUncheckedCreateWithoutLabelInput = {
    taskId: string
  }

  export type TaskLabelCreateOrConnectWithoutLabelInput = {
    where: TaskLabelWhereUniqueInput
    create: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput>
  }

  export type TaskLabelCreateManyLabelInputEnvelope = {
    data: TaskLabelCreateManyLabelInput | TaskLabelCreateManyLabelInput[]
    skipDuplicates?: boolean
  }

  export type BoardUpsertWithoutLabelsInput = {
    update: XOR<BoardUpdateWithoutLabelsInput, BoardUncheckedUpdateWithoutLabelsInput>
    create: XOR<BoardCreateWithoutLabelsInput, BoardUncheckedCreateWithoutLabelsInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutLabelsInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutLabelsInput, BoardUncheckedUpdateWithoutLabelsInput>
  }

  export type BoardUpdateWithoutLabelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    activity?: ActivityUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutLabelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    activity?: ActivityUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type TaskLabelUpsertWithWhereUniqueWithoutLabelInput = {
    where: TaskLabelWhereUniqueInput
    update: XOR<TaskLabelUpdateWithoutLabelInput, TaskLabelUncheckedUpdateWithoutLabelInput>
    create: XOR<TaskLabelCreateWithoutLabelInput, TaskLabelUncheckedCreateWithoutLabelInput>
  }

  export type TaskLabelUpdateWithWhereUniqueWithoutLabelInput = {
    where: TaskLabelWhereUniqueInput
    data: XOR<TaskLabelUpdateWithoutLabelInput, TaskLabelUncheckedUpdateWithoutLabelInput>
  }

  export type TaskLabelUpdateManyWithWhereWithoutLabelInput = {
    where: TaskLabelScalarWhereInput
    data: XOR<TaskLabelUpdateManyMutationInput, TaskLabelUncheckedUpdateManyWithoutLabelInput>
  }

  export type TaskCreateWithoutLabelsInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutLabelsInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutLabelsInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutLabelsInput, TaskUncheckedCreateWithoutLabelsInput>
  }

  export type LabelCreateWithoutTasksInput = {
    id?: string
    name: string
    color: string
    createdAt?: Date | string
    board: BoardCreateNestedOneWithoutLabelsInput
  }

  export type LabelUncheckedCreateWithoutTasksInput = {
    id?: string
    boardId: string
    name: string
    color: string
    createdAt?: Date | string
  }

  export type LabelCreateOrConnectWithoutTasksInput = {
    where: LabelWhereUniqueInput
    create: XOR<LabelCreateWithoutTasksInput, LabelUncheckedCreateWithoutTasksInput>
  }

  export type TaskUpsertWithoutLabelsInput = {
    update: XOR<TaskUpdateWithoutLabelsInput, TaskUncheckedUpdateWithoutLabelsInput>
    create: XOR<TaskCreateWithoutLabelsInput, TaskUncheckedCreateWithoutLabelsInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutLabelsInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutLabelsInput, TaskUncheckedUpdateWithoutLabelsInput>
  }

  export type TaskUpdateWithoutLabelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutLabelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type LabelUpsertWithoutTasksInput = {
    update: XOR<LabelUpdateWithoutTasksInput, LabelUncheckedUpdateWithoutTasksInput>
    create: XOR<LabelCreateWithoutTasksInput, LabelUncheckedCreateWithoutTasksInput>
    where?: LabelWhereInput
  }

  export type LabelUpdateToOneWithWhereWithoutTasksInput = {
    where?: LabelWhereInput
    data: XOR<LabelUpdateWithoutTasksInput, LabelUncheckedUpdateWithoutTasksInput>
  }

  export type LabelUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutLabelsNestedInput
  }

  export type LabelUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateWithoutCommentsInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutCommentsInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutCommentsInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutCommentsInput, TaskUncheckedCreateWithoutCommentsInput>
  }

  export type TaskUpsertWithoutCommentsInput = {
    update: XOR<TaskUpdateWithoutCommentsInput, TaskUncheckedUpdateWithoutCommentsInput>
    create: XOR<TaskCreateWithoutCommentsInput, TaskUncheckedCreateWithoutCommentsInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutCommentsInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutCommentsInput, TaskUncheckedUpdateWithoutCommentsInput>
  }

  export type TaskUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskCreateWithoutAttachmentsInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutAttachmentsInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutAttachmentsInput, TaskUncheckedCreateWithoutAttachmentsInput>
  }

  export type TaskUpsertWithoutAttachmentsInput = {
    update: XOR<TaskUpdateWithoutAttachmentsInput, TaskUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<TaskCreateWithoutAttachmentsInput, TaskUncheckedCreateWithoutAttachmentsInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutAttachmentsInput, TaskUncheckedUpdateWithoutAttachmentsInput>
  }

  export type TaskUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskCreateWithoutTimeEntriesInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutTimeEntriesInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    watchers?: TaskWatcherUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutTimeEntriesInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutTimeEntriesInput, TaskUncheckedCreateWithoutTimeEntriesInput>
  }

  export type TaskUpsertWithoutTimeEntriesInput = {
    update: XOR<TaskUpdateWithoutTimeEntriesInput, TaskUncheckedUpdateWithoutTimeEntriesInput>
    create: XOR<TaskCreateWithoutTimeEntriesInput, TaskUncheckedCreateWithoutTimeEntriesInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutTimeEntriesInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutTimeEntriesInput, TaskUncheckedUpdateWithoutTimeEntriesInput>
  }

  export type TaskUpdateWithoutTimeEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutTimeEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskCreateWithoutWatchersInput = {
    id?: string
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    board: BoardCreateNestedOneWithoutTasksInput
    column: ColumnCreateNestedOneWithoutTasksInput
    sprint?: SprintCreateNestedOneWithoutTasksInput
    epic?: EpicCreateNestedOneWithoutTasksInput
    parent?: TaskCreateNestedOneWithoutSubtasksInput
    subtasks?: TaskCreateNestedManyWithoutParentInput
    labels?: TaskLabelCreateNestedManyWithoutTaskInput
    comments?: CommentCreateNestedManyWithoutTaskInput
    attachments?: AttachmentCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryCreateNestedManyWithoutTaskInput
  }

  export type TaskUncheckedCreateWithoutWatchersInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subtasks?: TaskUncheckedCreateNestedManyWithoutParentInput
    labels?: TaskLabelUncheckedCreateNestedManyWithoutTaskInput
    comments?: CommentUncheckedCreateNestedManyWithoutTaskInput
    attachments?: AttachmentUncheckedCreateNestedManyWithoutTaskInput
    timeEntries?: TimeEntryUncheckedCreateNestedManyWithoutTaskInput
  }

  export type TaskCreateOrConnectWithoutWatchersInput = {
    where: TaskWhereUniqueInput
    create: XOR<TaskCreateWithoutWatchersInput, TaskUncheckedCreateWithoutWatchersInput>
  }

  export type TaskUpsertWithoutWatchersInput = {
    update: XOR<TaskUpdateWithoutWatchersInput, TaskUncheckedUpdateWithoutWatchersInput>
    create: XOR<TaskCreateWithoutWatchersInput, TaskUncheckedCreateWithoutWatchersInput>
    where?: TaskWhereInput
  }

  export type TaskUpdateToOneWithWhereWithoutWatchersInput = {
    where?: TaskWhereInput
    data: XOR<TaskUpdateWithoutWatchersInput, TaskUncheckedUpdateWithoutWatchersInput>
  }

  export type TaskUpdateWithoutWatchersInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutWatchersInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type BoardCreateWithoutActivityInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnCreateNestedManyWithoutBoardInput
    tasks?: TaskCreateNestedManyWithoutBoardInput
    sprints?: SprintCreateNestedManyWithoutBoardInput
    epics?: EpicCreateNestedManyWithoutBoardInput
    labels?: LabelCreateNestedManyWithoutBoardInput
  }

  export type BoardUncheckedCreateWithoutActivityInput = {
    id?: string
    projectId: string
    name: string
    description?: string | null
    keyPrefix: string
    lastNumber?: number
    visibility?: $Enums.BoardVisibility
    createdBy: string
    archived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    columns?: ColumnUncheckedCreateNestedManyWithoutBoardInput
    tasks?: TaskUncheckedCreateNestedManyWithoutBoardInput
    sprints?: SprintUncheckedCreateNestedManyWithoutBoardInput
    epics?: EpicUncheckedCreateNestedManyWithoutBoardInput
    labels?: LabelUncheckedCreateNestedManyWithoutBoardInput
  }

  export type BoardCreateOrConnectWithoutActivityInput = {
    where: BoardWhereUniqueInput
    create: XOR<BoardCreateWithoutActivityInput, BoardUncheckedCreateWithoutActivityInput>
  }

  export type BoardUpsertWithoutActivityInput = {
    update: XOR<BoardUpdateWithoutActivityInput, BoardUncheckedUpdateWithoutActivityInput>
    create: XOR<BoardCreateWithoutActivityInput, BoardUncheckedCreateWithoutActivityInput>
    where?: BoardWhereInput
  }

  export type BoardUpdateToOneWithWhereWithoutActivityInput = {
    where?: BoardWhereInput
    data: XOR<BoardUpdateWithoutActivityInput, BoardUncheckedUpdateWithoutActivityInput>
  }

  export type BoardUpdateWithoutActivityInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUpdateManyWithoutBoardNestedInput
    tasks?: TaskUpdateManyWithoutBoardNestedInput
    sprints?: SprintUpdateManyWithoutBoardNestedInput
    epics?: EpicUpdateManyWithoutBoardNestedInput
    labels?: LabelUpdateManyWithoutBoardNestedInput
  }

  export type BoardUncheckedUpdateWithoutActivityInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    keyPrefix?: StringFieldUpdateOperationsInput | string
    lastNumber?: IntFieldUpdateOperationsInput | number
    visibility?: EnumBoardVisibilityFieldUpdateOperationsInput | $Enums.BoardVisibility
    createdBy?: StringFieldUpdateOperationsInput | string
    archived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: ColumnUncheckedUpdateManyWithoutBoardNestedInput
    tasks?: TaskUncheckedUpdateManyWithoutBoardNestedInput
    sprints?: SprintUncheckedUpdateManyWithoutBoardNestedInput
    epics?: EpicUncheckedUpdateManyWithoutBoardNestedInput
    labels?: LabelUncheckedUpdateManyWithoutBoardNestedInput
  }

  export type ColumnCreateManyBoardInput = {
    id?: string
    name: string
    color?: string
    status?: $Enums.TaskStatus
    order: number
    wipLimit?: number | null
    createdAt?: Date | string
  }

  export type TaskCreateManyBoardInput = {
    id?: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SprintCreateManyBoardInput = {
    id?: string
    name: string
    goal?: string | null
    startDate: Date | string
    endDate: Date | string
    status?: $Enums.SprintStatus
    committedPoints?: number | null
    completedPoints?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EpicCreateManyBoardInput = {
    id?: string
    name: string
    description?: string | null
    color?: string
    createdAt?: Date | string
  }

  export type LabelCreateManyBoardInput = {
    id?: string
    name: string
    color: string
    createdAt?: Date | string
  }

  export type ActivityCreateManyBoardInput = {
    id?: string
    taskId?: string | null
    userId: string
    action: string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ColumnUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutColumnNestedInput
  }

  export type ColumnUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutColumnNestedInput
  }

  export type ColumnUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    order?: FloatFieldUpdateOperationsInput | number
    wipLimit?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SprintUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutSprintNestedInput
  }

  export type SprintUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutSprintNestedInput
  }

  export type SprintUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    goal?: NullableStringFieldUpdateOperationsInput | string | null
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSprintStatusFieldUpdateOperationsInput | $Enums.SprintStatus
    committedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    completedPoints?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskUncheckedUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabelUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskLabelUpdateManyWithoutLabelNestedInput
  }

  export type LabelUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: TaskLabelUncheckedUpdateManyWithoutLabelNestedInput
  }

  export type LabelUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUncheckedUpdateWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUncheckedUpdateManyWithoutBoardInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    detail?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateManyColumnInput = {
    id?: string
    boardId: string
    sprintId?: string | null
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateWithoutColumnInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutColumnInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutColumnInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateManyParentInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    epicId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskLabelCreateManyTaskInput = {
    labelId: string
  }

  export type CommentCreateManyTaskInput = {
    id?: string
    userId: string
    content: string
    mentions?: CommentCreatementionsInput | string[]
    edited?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttachmentCreateManyTaskInput = {
    id?: string
    fileId: string
    name: string
    mimeType: string
    size: number
    addedBy: string
    createdAt?: Date | string
  }

  export type TimeEntryCreateManyTaskInput = {
    id?: string
    userId: string
    hours: number
    description?: string | null
    date: Date | string
    createdAt?: Date | string
  }

  export type TaskWatcherCreateManyTaskInput = {
    userId: string
  }

  export type TaskUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskLabelUpdateWithoutTaskInput = {
    label?: LabelUpdateOneRequiredWithoutTasksNestedInput
  }

  export type TaskLabelUncheckedUpdateWithoutTaskInput = {
    labelId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskLabelUncheckedUpdateManyWithoutTaskInput = {
    labelId?: StringFieldUpdateOperationsInput | string
  }

  export type CommentUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentUncheckedUpdateManyWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mentions?: CommentUpdatementionsInput | string[]
    edited?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateManyWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    addedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryUncheckedUpdateWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TimeEntryUncheckedUpdateManyWithoutTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskWatcherUpdateWithoutTaskInput = {
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskWatcherUncheckedUpdateWithoutTaskInput = {
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskWatcherUncheckedUpdateManyWithoutTaskInput = {
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskCreateManySprintInput = {
    id?: string
    boardId: string
    columnId: string
    epicId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateWithoutSprintInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    epic?: EpicUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutSprintInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutSprintInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    epicId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskCreateManyEpicInput = {
    id?: string
    boardId: string
    columnId: string
    sprintId?: string | null
    parentId?: string | null
    number: number
    key: string
    title: string
    description?: string | null
    type?: $Enums.TaskType
    priority?: $Enums.Priority
    status?: $Enums.TaskStatus
    points?: number | null
    estimatedHours?: number | null
    order: number
    dueDate?: Date | string | null
    completedAt?: Date | string | null
    assigneeId?: string | null
    reporterId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TaskUpdateWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    board?: BoardUpdateOneRequiredWithoutTasksNestedInput
    column?: ColumnUpdateOneRequiredWithoutTasksNestedInput
    sprint?: SprintUpdateOneWithoutTasksNestedInput
    parent?: TaskUpdateOneWithoutSubtasksNestedInput
    subtasks?: TaskUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUpdateManyWithoutTaskNestedInput
    comments?: CommentUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subtasks?: TaskUncheckedUpdateManyWithoutParentNestedInput
    labels?: TaskLabelUncheckedUpdateManyWithoutTaskNestedInput
    comments?: CommentUncheckedUpdateManyWithoutTaskNestedInput
    attachments?: AttachmentUncheckedUpdateManyWithoutTaskNestedInput
    timeEntries?: TimeEntryUncheckedUpdateManyWithoutTaskNestedInput
    watchers?: TaskWatcherUncheckedUpdateManyWithoutTaskNestedInput
  }

  export type TaskUncheckedUpdateManyWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    boardId?: StringFieldUpdateOperationsInput | string
    columnId?: StringFieldUpdateOperationsInput | string
    sprintId?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    number?: IntFieldUpdateOperationsInput | number
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumTaskTypeFieldUpdateOperationsInput | $Enums.TaskType
    priority?: EnumPriorityFieldUpdateOperationsInput | $Enums.Priority
    status?: EnumTaskStatusFieldUpdateOperationsInput | $Enums.TaskStatus
    points?: NullableIntFieldUpdateOperationsInput | number | null
    estimatedHours?: NullableFloatFieldUpdateOperationsInput | number | null
    order?: FloatFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    assigneeId?: NullableStringFieldUpdateOperationsInput | string | null
    reporterId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TaskLabelCreateManyLabelInput = {
    taskId: string
  }

  export type TaskLabelUpdateWithoutLabelInput = {
    task?: TaskUpdateOneRequiredWithoutLabelsNestedInput
  }

  export type TaskLabelUncheckedUpdateWithoutLabelInput = {
    taskId?: StringFieldUpdateOperationsInput | string
  }

  export type TaskLabelUncheckedUpdateManyWithoutLabelInput = {
    taskId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use BoardCountOutputTypeDefaultArgs instead
     */
    export type BoardCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BoardCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ColumnCountOutputTypeDefaultArgs instead
     */
    export type ColumnCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ColumnCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaskCountOutputTypeDefaultArgs instead
     */
    export type TaskCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SprintCountOutputTypeDefaultArgs instead
     */
    export type SprintCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SprintCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EpicCountOutputTypeDefaultArgs instead
     */
    export type EpicCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EpicCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LabelCountOutputTypeDefaultArgs instead
     */
    export type LabelCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LabelCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserRefDefaultArgs instead
     */
    export type UserRefArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserRefDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BoardDefaultArgs instead
     */
    export type BoardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BoardDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ColumnDefaultArgs instead
     */
    export type ColumnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ColumnDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaskDefaultArgs instead
     */
    export type TaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SprintDefaultArgs instead
     */
    export type SprintArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SprintDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EpicDefaultArgs instead
     */
    export type EpicArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EpicDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LabelDefaultArgs instead
     */
    export type LabelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LabelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaskLabelDefaultArgs instead
     */
    export type TaskLabelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskLabelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CommentDefaultArgs instead
     */
    export type CommentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CommentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AttachmentDefaultArgs instead
     */
    export type AttachmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AttachmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TimeEntryDefaultArgs instead
     */
    export type TimeEntryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TimeEntryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TaskWatcherDefaultArgs instead
     */
    export type TaskWatcherArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TaskWatcherDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ActivityDefaultArgs instead
     */
    export type ActivityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ActivityDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}