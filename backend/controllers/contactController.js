// @desc    Submit a contact inquiry form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
  const { name, email, phone, company, subject, message } = req.body;

  try {
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message.' });
    }

    // Print to server console for testing/debugging
    console.log(`[Contact Inquiry Recieved]
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'N/A'}
      Company: ${company || 'N/A'}
      Subject: ${subject || 'General Inquiry'}
      Message: ${message}
    `);

    // In a live system, you could store in a database or send email alerts to cocoveera admins
    return res.status(200).json({
      success: true,
      message: 'Your message was successfully received. Our global sales team will respond within 24 hours.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
