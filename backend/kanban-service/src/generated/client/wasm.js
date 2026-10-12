
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserRefScalarFieldEnum = {
  id: 'id',
  name: 'name',
  avatar: 'avatar',
  updatedAt: 'updatedAt'
};

exports.Prisma.BoardScalarFieldEnum = {
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

exports.Prisma.ColumnScalarFieldEnum = {
  id: 'id',
  boardId: 'boardId',
  name: 'name',
  color: 'color',
  status: 'status',
  order: 'order',
  wipLimit: 'wipLimit',
  createdAt: 'createdAt'
};

exports.Prisma.TaskScalarFieldEnum = {
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

exports.Prisma.SprintScalarFieldEnum = {
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

exports.Prisma.EpicScalarFieldEnum = {
  id: 'id',
  boardId: 'boardId',
  name: 'name',
  description: 'description',
  color: 'color',
  createdAt: 'createdAt'
};

exports.Prisma.LabelScalarFieldEnum = {
  id: 'id',
  boardId: 'boardId',
  name: 'name',
  color: 'color',
  createdAt: 'createdAt'
};

exports.Prisma.TaskLabelScalarFieldEnum = {
  taskId: 'taskId',
  labelId: 'labelId'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  userId: 'userId',
  content: 'content',
  mentions: 'mentions',
  edited: 'edited',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  fileId: 'fileId',
  name: 'name',
  mimeType: 'mimeType',
  size: 'size',
  addedBy: 'addedBy',
  createdAt: 'createdAt'
};

exports.Prisma.TimeEntryScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  userId: 'userId',
  hours: 'hours',
  description: 'description',
  date: 'date',
  createdAt: 'createdAt'
};

exports.Prisma.TaskWatcherScalarFieldEnum = {
  taskId: 'taskId',
  userId: 'userId'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  boardId: 'boardId',
  taskId: 'taskId',
  userId: 'userId',
  action: 'action',
  detail: 'detail',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.BoardVisibility = exports.$Enums.BoardVisibility = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED'
};

exports.TaskType = exports.$Enums.TaskType = {
  TASK: 'TASK',
  STORY: 'STORY',
  BUG: 'BUG',
  SUBTASK: 'SUBTASK'
};

exports.Priority = exports.$Enums.Priority = {
  LOWEST: 'LOWEST',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  HIGHEST: 'HIGHEST'
};

exports.SprintStatus = exports.$Enums.SprintStatus = {
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED'
};

exports.Prisma.ModelName = {
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

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
