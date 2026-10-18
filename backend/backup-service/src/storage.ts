/**
 * Where backup archives live: an S3 bucket (BACKUP_S3_BUCKET, or S3_BUCKET under the `backups/`
 * prefix) or a local directory (BACKUP_DIR). Each backup is `<id>.tar.gz` plus `<id>.json` metadata.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { Readable } from 'node:stream'
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@devhub/shared'

export interface BackupStore {
  readonly kind: 'local' | 's3'
  readonly location: string
  putFile(key: string, file: string): Promise<void>
  getFile(key: string, dest: string): Promise<void>
  stream(key: string): Promise<Readable | null>
  putJSON(key: string, value: unknown): Promise<void>
  getJSON<T>(key: string): Promise<T | null>
  list(): Promise<string[]>
  remove(key: string): Promise<void>
}

class LocalStore implements BackupStore {
  readonly kind = 'local' as const
  constructor(readonly location: string) {
    fs.mkdirSync(location, { recursive: true })
  }
  private p(key: string) {
    return path.join(this.location, path.basename(key))
  }
  async putFile(key: string, file: string) {
    await fs.promises.copyFile(file, this.p(key))
  }
  async getFile(key: string, dest: string) {
    await fs.promises.copyFile(this.p(key), dest)
  }
  async stream(key: string) {
    return fs.existsSync(this.p(key)) ? fs.createReadStream(this.p(key)) : null
  }
  async putJSON(key: string, value: unknown) {
    const tmp = `${this.p(key)}.tmp`
    await fs.promises.writeFile(tmp, JSON.stringify(value, null, 2))
    await fs.promises.rename(tmp, this.p(key))
  }
  async getJSON<T>(key: string) {
    try {
      return JSON.parse(await fs.promises.readFile(this.p(key), 'utf8')) as T
    } catch {
      return null
    }
  }
  async list() {
    return fs.promises.readdir(this.location)
  }
  async remove(key: string) {
    await fs.promises.rm(this.p(key), { force: true })
  }
}

class S3Store implements BackupStore {
  readonly kind = 's3' as const
  private readonly s3 = new S3Client({ region: env('S3_REGION', 'us-east-1'), ...(env('S3_ENDPOINT') ? { endpoint: env('S3_ENDPOINT'), forcePathStyle: true } : {}) })
  readonly location: string
  constructor(private readonly bucket: string, private readonly prefix: string) {
    this.location = `s3://${bucket}/${prefix}`
  }
  async putFile(key: string, file: string) {
    const { size } = await fs.promises.stat(file)
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: this.prefix + key, Body: fs.createReadStream(file), ContentLength: size, ContentType: 'application/gzip' }))
  }
  async getFile(key: string, dest: string) {
    const body = await this.stream(key)
    if (!body) throw new Error(`Backup object ${key} not found`)
    await pipeline(body, fs.createWriteStream(dest))
  }
  async stream(key: string) {
    try {
      return (await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.prefix + key }))).Body as Readable
    } catch (e) {
      if ((e as { name?: string }).name === 'NoSuchKey') return null
      throw e
    }
  }
  async putJSON(key: string, value: unknown) {
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: this.prefix + key, Body: JSON.stringify(value, null, 2), ContentType: 'application/json' }))
  }
  async getJSON<T>(key: string) {
    const body = await this.stream(key)
    if (!body) return null
    const chunks: Buffer[] = []
    for await (const c of body) chunks.push(c as Buffer)
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
  }
  async list() {
    const keys: string[] = []
    let token: string | undefined
    do {
      const out = await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: this.prefix, ContinuationToken: token }))
      for (const o of out.Contents ?? []) if (o.Key) keys.push(o.Key.slice(this.prefix.length))
      token = out.NextContinuationToken
    } while (token)
    return keys
  }
  async remove(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.prefix + key }))
  }
}

export function createStore(): BackupStore {
  const bucket = env('BACKUP_S3_BUCKET') || env('S3_BUCKET')
  if (bucket) return new S3Store(bucket, env('BACKUP_S3_PREFIX', 'backups/'))
  return new LocalStore(path.resolve(env('BACKUP_DIR', 'backups')))
}
