export default () => ({
  port: parseInt(process.env.LIREONS_MAIN_PORT || '4000', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  otp: {
    secret: process.env.OTP_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  aws: {
    s3: {
      region: process.env.AWS_S3_REGION,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_S3_ENDPOINT,
      forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE,
    },
  },
});
