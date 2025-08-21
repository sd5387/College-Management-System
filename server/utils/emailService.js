const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendLowAttendanceEmail = async (student, subject, attendancePercentage) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Low Attendance Alert - SRM College',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d9534f;">Low Attendance Alert</h2>
        <p>Dear ${student.name},</p>
        <p>Your attendance in <strong>${subject.subjectName}</strong> is currently <strong>${attendancePercentage}%</strong>, which is below the required threshold of 75%.</p>
        <p>Please ensure you attend classes regularly to avoid being marked as a defaulter.</p>
        <br>
        <p>Best regards,</p>
        <p>SRM College Administration</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Low attendance email sent to ${student.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendLowAttendanceEmail };