import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { UploadImageFile } from './tenant.service';

@Injectable()
export class S3UploadService {
	private readonly s3Client: S3Client | null;
	private readonly bucketName: string;
	private readonly region: string;

	constructor(private readonly configService: ConfigService) {
		this.region = this.configService.get<string>('aws.s3.region') || '';
		this.bucketName = this.configService.get<string>('aws.s3.bucketName') || '';

		this.s3Client = this.region && this.bucketName
			? new S3Client({
					region: this.region,
					credentials: {
						accessKeyId:
							this.configService.get<string>('aws.s3.accessKeyId') || '',
						secretAccessKey:
							this.configService.get<string>('aws.s3.secretAccessKey') || '',
					},
				})
			: null;
	}

	private getPublicUrl(key: string): string {
		return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
	}

	async uploadPublicFile(file: UploadImageFile, key: string): Promise<string> {
		if (!this.bucketName || !this.region) {
			throw new InternalServerErrorException(
				'AWS S3 is not configured. Missing bucket name or region.',
			);
		}

		if (!this.s3Client) {
			throw new InternalServerErrorException(
				'AWS S3 client is not initialized. Check AWS S3 credentials and region.',
			);
		}

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		);

		return this.getPublicUrl(key);
	}
}