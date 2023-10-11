console.log('Server starting...');

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser'); // Add body-parser for parsing JSON request bodies

const app = express();

// Enable CORS to allow requests from your React frontend
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Define a route for sending emails
app.post('/send-email', async (req, res) => {
  try {
    const { senderEmail, password, subject, body, recipientEmail, attachment } = req.body;

    // Create a Nodemailer transporter using your SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use the email service provider you prefer
      auth: {
        user: senderEmail,
        pass: password,
      },
    });

    // Define email data
    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: subject,
      html: body,
      attachments: attachment ? [{ filename: 'attachment.jpg', content: attachment }] : [],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
