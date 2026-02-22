const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const juice = require('juice');
const { promisify } = require('util');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initializeTransporter();
    this.loadTemplates();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    const config = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10, // Max 10 messages per second
    };

    // Use ethereal for development if no credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Using ethereal email for development');
      nodemailer.createTestAccount().then(account => {
        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      });
    } else {
      this.transporter = nodemailer.createTransport(config);
    }
  }

  /**
   * Load email templates
   */
  async loadTemplates() {
    const templateDir = path.join(__dirname, '../templates/emails');
    
    try {
      const files = await fs.readdir(templateDir);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = path.basename(file, '.hbs');
          const content = await fs.readFile(path.join(templateDir, file), 'utf-8');
          
          // Compile template with Handlebars
          const template = handlebars.compile(content);
          this.templates.set(templateName, template);
        }
      }
      
      console.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      console.error('Error loading email templates:', error);
      this.loadDefaultTemplates();
    }
  }

  /**
   * Load default templates if files don't exist
   */
  loadDefaultTemplates() {
    const defaultTemplates = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b21a5, #f59e0b); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #6b21a5; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GalaxyVerse, {{username}}!</h1>
            </div>
            <div class="content">
              <p>Thank you for joining our space exploration community. We're excited to have you on board!</p>
              <p>Start exploring:</p>
              <ul>
                <li>🌌 Track upcoming space missions</li>
                <li>🪐 Explore the 3D Solar System</li>
                <li>📸 View NASA's Astronomy Picture of the Day</li>
                <li>👥 Connect with other space enthusiasts</li>
              </ul>
              <p style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Start Exploring</a>
              </p>
            </div>
            <div class="footer">
              <p>© {{year}} GalaxyVerse. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      verification: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b21a5, #f59e0b); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #6b21a5; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi {{username}},</p>
              <p>Please verify your email address to activate your GalaxyVerse account.</p>
              <p style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email</a>
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© {{year}} GalaxyVerse. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'password-reset': `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b21a5, #f59e0b); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #6b21a5; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi {{username}},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
              </p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© {{year}} GalaxyVerse. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    for (const [name, content] of Object.entries(defaultTemplates)) {
      this.templates.set(name, handlebars.compile(content));
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    const {
      to,
      subject,
      template,
      context = {},
      attachments = [],
      cc,
      bcc,
      replyTo,
    } = options;

    try {
      // Check if transporter is initialized
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Get and compile template
      const templateFn = this.templates.get(template);
      if (!templateFn) {
        throw new Error(`Email template '${template}' not found`);
      }

      // Add default context
      const fullContext = {
        ...context,
        year: new Date().getFullYear(),
        appName: 'GalaxyVerse',
        appUrl: process.env.APP_URL || 'http://localhost:3000',
      };

      // Generate HTML
      let html = templateFn(fullContext);

      // Inline CSS for email clients
      html = juice(html);

      // Prepare email options
      const mailOptions = {
        from: `"GalaxyVerse" <${process.env.EMAIL_FROM || 'noreply@galaxyverse.com'}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments,
      };

      if (cc) mailOptions.cc = cc;
      if (bcc) mailOptions.bcc = bcc;
      if (replyTo) mailOptions.replyTo = replyTo;

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent:', info.messageId);
        if (info.previewUrl) {
          console.log('Preview URL:', info.previewUrl);
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: info.previewUrl,
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send welcome email
   * @param {string} to - Recipient email
   * @param {string} username - Username
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(to, username) {
    return this.sendEmail({
      to,
      subject: 'Welcome to GalaxyVerse! 🚀',
      template: 'welcome',
      context: {
        username,
        loginUrl: `${process.env.APP_URL || 'http://localhost:3000'}/login`,
      },
    });
  }

  /**
   * Send verification email
   * @param {string} to - Recipient email
   * @param {string} username - Username
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Send result
   */
  async sendVerificationEmail(to, username, token) {
    return this.sendEmail({
      to,
      subject: 'Verify Your GalaxyVerse Email',
      template: 'verification',
      context: {
        username,
        verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/verify-email/${token}`,
      },
    });
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} username - Username
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(to, username, token) {
    return this.sendEmail({
      to,
      subject: 'Reset Your GalaxyVerse Password',
      template: 'password-reset',
      context: {
        username,
        resetUrl: `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${token}`,
      },
    });
  }

  /**
   * Send password changed notification
   * @param {string} to - Recipient email
   * @param {string} username - Username
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordChangedEmail(to, username) {
    return this.sendEmail({
      to,
      subject: 'Your Password Has Been Changed',
      template: 'password-changed',
      context: { username },
    });
  }

  /**
   * Send mission update email
   * @param {string} to - Recipient email
   * @param {Object} data - Mission data
   * @returns {Promise<Object>} Send result
   */
  async sendMissionUpdateEmail(to, data) {
    return this.sendEmail({
      to,
      subject: `🚀 Mission Update: ${data.missionName}`,
      template: 'mission-update',
      context: data,
    });
  }

  /**
   * Send quiz result email
   * @param {string} to - Recipient email
   * @param {Object} data - Quiz result data
   * @returns {Promise<Object>} Send result
   */
  async sendQuizResultEmail(to, data) {
    return this.sendEmail({
      to,
      subject: `🎯 Your Quiz Result: ${data.quizTitle}`,
      template: 'quiz-result',
      context: data,
      attachments: data.certificate ? [{
        filename: 'certificate.pdf',
        content: data.certificate,
        contentType: 'application/pdf',
      }] : [],
    });
  }

  /**
   * Send achievement unlocked email
   * @param {string} to - Recipient email
   * @param {Object} data - Achievement data
   * @returns {Promise<Object>} Send result
   */
  async sendAchievementEmail(to, data) {
    return this.sendEmail({
      to,
      subject: `🏆 Achievement Unlocked: ${data.achievementName}`,
      template: 'achievement',
      context: data,
    });
  }

  /**
   * Send bulk emails
   * @param {Array<Object>} emails - Array of email options
   * @returns {Promise<Array>} Send results
   */
  async sendBulk(emails) {
    const results = [];
    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push(result);
        
        // Rate limiting - wait between sends
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>} Verification result
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
      return false;
    }
  }

  /**
   * Add custom template
   * @param {string} name - Template name
   * @param {string} content - Template content
   */
  addTemplate(name, content) {
    const template = handlebars.compile(content);
    this.templates.set(name, template);
  }

  /**
   * Get template list
   * @returns {Array<string>} Template names
   */
  getTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * Create test email account (ethereal)
   * @returns {Promise<Object>} Test account
   */
  async createTestAccount() {
    return await nodemailer.createTestAccount();
  }

  /**
   * Get email preview URL
   * @param {string} messageId - Message ID
   * @returns {string} Preview URL
   */
  getPreviewUrl(messageId) {
    return `https://ethereal.email/message/${messageId}`;
  }
}

module.exports = new EmailService();
