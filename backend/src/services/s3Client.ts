import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3'
import type { S3ClientConfig } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const clientConfig: S3ClientConfig = {
    region: env.aws.region,
    forcePathStyle: true,
}

if (env.aws.s3Endpoint) {
    clientConfig.endpoint = env.aws.s3Endpoint
}

if (env.aws.accessKeyId && env.aws.secretAccessKey) {
    clientConfig.credentials = {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
    }
}

export const s3Client = new S3Client(clientConfig)

const profileBucket = env.aws.profileImageBucket || env.aws.bucket
const mediaBucket = env.aws.userMediaBucket || env.aws.bucket

export const uploadObject = async (
    key: string,
    body: Buffer | Uint8Array | string,
    type?: string,
    bucket?: string,
) =>
    s3Client.send(
        new PutObjectCommand({
            Bucket: bucket ?? env.aws.bucket,
            Key: key,
            Body: body,
            ContentType: type,
        }),
    )

export const deleteObject = async (key: string, bucket?: string) =>
    s3Client.send(
        new DeleteObjectCommand({
            Bucket: bucket ?? env.aws.bucket,
            Key: key,
        }),
    )

export const getObjectUrl = async (key: string, expiresInSeconds = 900, bucket?: string) =>
    getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: bucket ?? env.aws.bucket,
            Key: key,
        }),
        { expiresIn: expiresInSeconds },
    )

export const getProfileImageUrl = async (key?: string | null, expiresInSeconds = 7 * 24 * 60 * 60) => {
    if (!key) return ''
    return getObjectUrl(key, expiresInSeconds, profileBucket)
}

export const getUserMediaUrl = async (key?: string | null, expiresInSeconds = 7 * 24 * 60 * 60) => {
    if (!key) return ''
    return getObjectUrl(key, expiresInSeconds, mediaBucket)
}
