import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@devhub/shared'

export interface StoredObject {
  stream: Readable
  size?: number
  contentType?: string
}

export interface Storage {
  readonly kind: 'local' | 's3'
  put(key: string, body: Buffer, contentType: string): Promise<void>
  get(key: string): Promise<StoredObject | null>
  delete(key: string): Promise<void>
  /** Time-limited direct download URL (S3 only). */
  presign(key: string, seconds: number, filename?: string): Promise<string | null>
}

/** Keys come from our own code, but never trust that: refuse anything that could leave the base directory. */
const safe = (base: string, key: string) => {
  const full = path.resolve(base, key)
  if (!full.startsWith(path.resolve(base) + path.sep)) throw new Error('Invalid storage key')
  return full
}

class LocalStorage implements Storage {
  readonly kind = 'local' as const
  constructor(private readonly base: string) {
    fs.mkdirSync(base, { recursive: true })
  }

  async put(key: string, body: Buffer) {
    const full = safe(this.base, key)
    await fs.promises.mkdir(path.dirname(full), { recursive: true })
    await fs.promises.writeFile(full, body)
  }

  async get(key: string): Promise<StoredObject | null> {
    const full = safe(this.base, key)
    try {
      const stat = await fs.promises.stat(full)
      return { stream: fs.createReadStream(full), size: stat.size }
    } catch {
      return null
    }
  }

  async delete(key: string) {
    await fs.promises.rm(safe(this.base, key), { force: true })
  }

  async presign() {
    return null
  }
}

class S3Storage implements Storage {
  readonly kind = 's3' as const
  private readonly s3: S3Client
  constructor(private readonly bucket: string) {
    this.s3 = new S3Client({
      region: env('S3_REGION', 'us-east-1'),
      ...(env('S3_ENDPOINT') ? { endpoint: env('S3_ENDPOINT'), forcePathStyle: true } : {}),
    })
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }))
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const out = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
      return { stream: out.Body as Readable, size: out.ContentLength, contentType: out.ContentType }
    } catch (e) {
      if ((e as { name?: string }).name === 'NoSuchKey') return null
      throw e
    }
  }

  async delete(key: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  async presign(key: string, seconds: number, filename?: string) {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key, ...(filename ? { ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, '')}"` } : {}) }),
      { expiresIn: seconds }
    )
  }
}

let instance: Storage | null = null
export function storage(): Storage {
  instance ??= env('S3_BUCKET') ? new S3Storage(env('S3_BUCKET')) : new LocalStorage(path.resolve(env('UPLOAD_DIR', 'uploads')))
  return instance
}

export const send = (obj: StoredObject, res: NodeJS.WritableStream) => pipeline(obj.stream, res)
