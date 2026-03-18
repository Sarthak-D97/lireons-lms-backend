import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { UploadImageFile } from './tenant.service';

@Injectable()
export class S3UploadService {
	private readonly s3Client: S3Client | null;
	private readonly bucketName: string;
	private readonly region: string;
	private readonly endpoint: string;
	private readonly forcePathStyle: boolean;
	private readonly isProduction: boolean;

	constructor(private readonly configService: ConfigService) {
		this.region = this.configService.get<string>('aws.s3.region') || '';
		this.bucketName = this.configService.get<string>('aws.s3.bucketName') || '';
		this.endpoint =
			(this.configService.get<string>('aws.s3.endpoint') || '').trim().replace(/\/$/, '');
		this.forcePathStyle =
			(this.configService.get<string>('aws.s3.forcePathStyle') || '').toLowerCase() === 'true';
		this.isProduction = process.env.NODE_ENV === 'production';

		this.s3Client = this.region && this.bucketName
			? new S3Client({
					region: this.region,
					endpoint: this.endpoint || undefined,
					forcePathStyle: this.forcePathStyle,
					followRegionRedirects: true,
					...(this.configService.get<string>('aws.s3.accessKeyId') &&
					this.configService.get<string>('aws.s3.secretAccessKey')
						? {
							credentials: {
								accessKeyId:
									this.configService.get<string>('aws.s3.accessKeyId') || '',
								secretAccessKey:
									this.configService.get<string>('aws.s3.secretAccessKey') || '',
							},
						}
						: {}),
				})
			: null;
	}

	private getPublicUrl(key: string): string {
		if (this.endpoint) {
			if (this.forcePathStyle) {
				return `${this.endpoint}/${this.bucketName}/${key}`;
			}

			const endpointUrl = new URL(this.endpoint);
			return `${endpointUrl.protocol}//${this.bucketName}.${endpointUrl.host}/${key}`;
		}

		return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
	}

	async uploadPublicFile(file: UploadImageFile, key: string): Promise<string> {
		if (!this.bucketName || !this.region) {
			if (!this.isProduction) {
				return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
			}

			throw new InternalServerErrorException(
				'AWS S3 is not configured. Missing bucket name or region.',
			);
		}

		if (!this.s3Client) {
			throw new InternalServerErrorException(
				'AWS S3 client is not initialized. Check AWS S3 credentials and region.',
			);
		}

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: key,
					Body: file.buffer,
					ContentType: file.mimetype,
				}),
			);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Unknown S3 upload error';
			const bucketRegion =
				typeof error === 'object' &&
				error !== null &&
				'$response' in error &&
				typeof (error as { $response?: { headers?: Record<string, string> } }).$response
					=== 'object'
					? (error as { $response?: { headers?: Record<string, string> } }).$response
						?.headers?.['x-amz-bucket-region']
					: undefined;

			const endpointHint = message.includes('must be addressed using the specified endpoint')
				? ` Check AWS_S3_REGION (current: ${this.region})${bucketRegion ? `, bucket region: ${bucketRegion}` : ''} and AWS_S3_ENDPOINT.`
				: '';

			throw new InternalServerErrorException(
				`AWS S3 upload failed: ${message}${endpointHint}`,
			);
		}

		return this.getPublicUrl(key);
	}
}