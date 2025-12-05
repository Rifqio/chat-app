import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env.js'

const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: env.aws.region,
}

if (env.aws.accessKeyId && env.aws.secretAccessKey) {
    clientConfig.credentials = {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
    }
}

export const s3Client = new S3Client(clientConfig)

export const uploadObject = async (
    key: string,
    body: Buffer | Uint8Array | string,
    type?: string,
) =>
    s3Client.send(
        new PutObjectCommand({
            Bucket: env.aws.bucket,
            Key: key,
            Body: body,
            ContentType: type,
        }),
    )

export const deleteObject = async (key: string) =>
    s3Client.send(
        new DeleteObjectCommand({
            Bucket: env.aws.bucket,
            Key: key,
        }),
    )

export const getObjectUrl = async (key: string, expiresInSeconds = 900) =>
    getSignedUrl(
        s3Client,
        new GetObjectCommand({
            Bucket: env.aws.bucket,
            Key: key,
        }),
        { expiresIn: expiresInSeconds },
    )
