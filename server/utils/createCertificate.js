const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../config/cloudinary');

const generateCertificate = async ({ username, quizTitle, score, date }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50,
      });

      // Create a temporary file path
      const fileName = `certificate-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/certificates', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0f');

      // Add decorative border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#6b21a5');

      // Add galaxy texture effect (simulated with stars)
      for (let i = 0; i < 100; i++) {
        doc.rect(
          30 + Math.random() * (doc.page.width - 60),
          30 + Math.random() * (doc.page.height - 60),
          1, 1
        ).fill('#ffffff');
      }

      // Add title
      doc.fontSize(48)
        .font('Helvetica-Bold')
        .fillColor('#f59e0b')
        .text('CERTIFICATE', 0, 120, { align: 'center' });

      doc.fontSize(24)
        .font('Helvetica')
        .fillColor('#ffffff')
        .text('OF ACHIEVEMENT', 0, 180, { align: 'center' });

      // Add presentation line
      doc.fontSize(16)
        .fillColor('#cccccc')
        .text('This is to certify that', 0, 250, { align: 'center' });

      // Add username
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#6b21a5')
        .text(username, 0, 290, { align: 'center' });

      // Add completion text
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#cccccc')
        .text('has successfully completed the quiz', 0, 350, { align: 'center' });

      // Add quiz title
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#f59e0b')
        .text(quizTitle, 0, 390, { align: 'center' });

      // Add score
      doc.fontSize(20)
        .fillColor('#ffffff')
        .text(`with a score of ${score.toFixed(1)}%`, 0, 440, { align: 'center' });

      // Add date
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.fontSize(14)
        .fillColor('#888888')
        .text(`Awarded on ${formattedDate}`, 0, 500, { align: 'center' });

      // Add signature line
      doc.moveTo(200, 550)
        .lineTo(400, 550)
        .stroke('#6b21a5');

      doc.fontSize(12)
        .fillColor('#888888')
        .text('GalaxyVerse Admin', 250, 560);

      // Add seal/stamp
      doc.circle(520, 520, 40)
        .lineWidth(2)
        .stroke('#f59e0b');

      doc.fontSize(10)
        .fillColor('#f59e0b')
        .text('GALAXYVERSE', 485, 515)
        .text('SPACE ACADEMY', 485, 530);

      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      stream.on('finish', async () => {
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(filePath, 'certificates');
          
          // Delete temporary file
          fs.unlinkSync(filePath);
          
          resolve(uploadResult.url);
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };
