export default () => ({
  port: parseInt(process.env.LIREONS_MAIN_PORT || '4000', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '30d',
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
});
