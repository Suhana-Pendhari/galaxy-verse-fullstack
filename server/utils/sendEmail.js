const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to GalaxyVerse! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Welcome to GalaxyVerse, ${data.username}!</h1>
        <p>Thank you for joining our space exploration community. We're excited to have you on board!</p>
        <p>Start exploring:</p>
        <ul>
          <li>🌌 Track upcoming space missions</li>
          <li>🪐 Explore the 3D Solar System</li>
          <li>📸 View NASA's Astronomy Picture of the Day</li>
          <li>👥 Connect with other space enthusiasts</li>
        </ul>
        <a href="${data.loginUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Exploring</a>
      </div>
    `,
  }),

  emailVerification: (data) => ({
    subject: 'Verify Your GalaxyVerse Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Verify Your Email</h1>
        <p>Hi ${data.username},</p>
        <p>Please verify your email address to activate your GalaxyVerse account.</p>
        <a href="${data.verificationUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Reset Your GalaxyVerse Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Reset Your Password</h1>
        <p>Hi ${data.username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${data.resetUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  }),

  passwordChanged: (data) => ({
    subject: 'Your GalaxyVerse Password Has Been Changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Password Changed Successfully</h1>
        <p>Hi ${data.username},</p>
        <p>Your GalaxyVerse password has been successfully changed.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>
    `,
  }),

  missionUpdate: (data) => ({
    subject: `🚀 Mission Update: ${data.missionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Mission Status Update</h1>
        <h2>${data.missionName}</h2>
        <p><strong>Status changed from:</strong> ${data.oldStatus}</p>
        <p><strong>To:</strong> ${data.newStatus}</p>
        ${data.message ? `<p>${data.message}</p>` : ''}
        <a href="${data.missionUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Mission</a>
      </div>
    `,
  }),

  quizResult: (data) => ({
    subject: `🎯 Your Quiz Result: ${data.quizTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Quiz Completed!</h1>
        <h2>${data.quizTitle}</h2>
        <p><strong>Your Score:</strong> ${data.score}%</p>
        <p><strong>Result:</strong> ${data.passed ? '✅ Passed' : '❌ Needs Improvement'}</p>
        ${data.certificateUrl ? `<p>🎉 Congratulations! You've earned a certificate.</p>` : ''}
        <a href="${data.quizUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Results</a>
      </div>
    `,
  }),

  achievementUnlocked: (data) => ({
    subject: `🏆 Achievement Unlocked: ${data.achievementName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b21a5;">Congratulations!</h1>
        <p>You've unlocked a new achievement:</p>
        <div style="background: #1a1a2e; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${data.icon || '🏆'}</div>
          <h2 style="color: #f59e0b; margin: 0;">${data.achievementName}</h2>
          <p style="color: white;">${data.description}</p>
        </div>
        <a href="${data.profileUrl}" style="background: #6b21a5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Achievements</a>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async ({ to, subject, template, context }) => {
  try {
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    // Get template
    const templateFn = templates[template];
    if (!templateFn) {
      throw new Error(`Email template '${template}' not found`);
    }

    const emailContent = templateFn(context);

    const mailOptions = {
      from: `"GalaxyVerse" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
  templates,
};
