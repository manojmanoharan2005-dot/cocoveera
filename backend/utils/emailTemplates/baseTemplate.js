/**
 * File: backend/utils/emailTemplates/baseTemplate.js
 * Purpose: Utility helper functions used across the backend.
 */
export const baseTemplate = ({ title, preheader, content }) => {
  const logoUrl = process.env.LOGO_URL || 'https://res.cloudinary.com/dyrfiop7d/image/upload/v1779801371/cocoveera/branding/ewo6ljdta2dklg9kvbrs.jpg';
  const frontendUrl = process.env.FRONTEND_URL || 'https://cocoveera.com';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root {
      color-scheme: light;
    }
    @media only screen and (max-width: 600px) {
      .outer-wrapper { padding: 10px 5px !important; }
      .header-cell { padding: 30px 15px 20px 15px !important; }
      .content-cell { padding: 30px 15px !important; }
      .footer-cell { padding: 25px 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
  ${preheader ? `<span style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  
  <div class="outer-wrapper" style="background-color: #FFFFFF; padding: 30px 10px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF;">
      <!-- Top Decorative Bar -->
      <tr>
        <td height="4" style="background-color: #1E5B2E;"></td>
      </tr>
      <!-- Header -->
      <tr>
        <td class="header-cell" align="center" style="padding: 40px 20px 30px 20px; border-bottom: 1px solid #E5E7EB; background-color: #FFFFFF;">
          ${logoUrl ? `
            <div style="margin-bottom: 15px; display: inline-block;">
              <img src="${logoUrl}" alt="Cocoveera Logo" style="max-height: 60px; display: block;" />
            </div>
          ` : ''}
          <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">
            <span style="color: #8B4513;">COCO</span><span style="color: #1E5B2E;">VEERA</span>
          </h1>
          <div style="height: 2px; width: 40px; background-color: #B8860B; margin: 12px auto;"></div>
          <p style="color: #B8860B; margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-style: italic; font-size: 13px; letter-spacing: 0.5px;">Premium Coconut Substrates & Lab Quality Testing</p>
        </td>
      </tr>
      <!-- Content Body -->
      <tr>
        <td class="content-cell" style="padding: 40px 20px; font-size: 15px; color: #333333; line-height: 1.6; background-color: #FFFFFF;">
          ${content}
        </td>
      </tr>
      <!-- Signature -->
      <tr>
        <td class="content-cell" style="padding: 0 20px 40px 20px; font-size: 15px; color: #333333; background-color: #FFFFFF;">
          <div style="border-top: 1px solid #E5E7EB; padding-top: 25px;">
            <p style="margin: 0; color: #666666; font-size: 14px; font-style: italic;">Yours sincerely,</p>
            <p style="margin: 5px 0 0 0; font-family: Georgia, 'Times New Roman', Times, serif; color: #1E5B2E; font-size: 16px; font-weight: bold;">The Cocoveera Executive Desk</p>
          </div>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td class="footer-cell" align="center" style="background-color: #F9FAFB; padding: 30px 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; line-height: 1.8;">
          <p style="margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: #1E5B2E; font-size: 12px;">Cocoveera Manufacturing & Exports</p>
          <p style="margin: 0 0 15px 0; font-style: italic;">Cochin Export Yard • Hamburg Desk • Los Angeles Distribution Hub</p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 0 8px; border-right: 1px solid #DCD5C9; font-weight: bold; color: #9E7E53;">OMRI Certified</td>
              <td style="padding: 0 8px; border-right: 1px solid #DCD5C9; font-weight: bold; color: #9E7E53;">100% Organic</td>
              <td style="padding: 0 8px; font-weight: bold; color: #9E7E53;">Peat-Free Coir</td>
            </tr>
          </table>
          <p style="margin: 0; color: #999999;">© ${year} Cocoveera Ltd. All rights reserved.</p>
          <p style="margin: 5px 0 0 0; color: #B5B0A6; font-size: 9px;">This is an automated transmission from the Cocoveera customer portal.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};
