const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/referrals', async (req, res) => {
  const { referrer, referee, email } = req.body;

  if (!referrer || !referee || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrer,
        referee,
        email,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Referral Invitation',
      text: `Hi ${referee},\n\nYou have been referred by ${referrer}. Join our course and enjoy the benefits!\n\nBest,\nYour Company`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Referral created and email sent', referral });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
