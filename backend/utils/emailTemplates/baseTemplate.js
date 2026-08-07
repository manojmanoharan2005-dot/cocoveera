/**
 * File: backend/utils/emailTemplates/baseTemplate.js
 * Purpose: Utility helper functions used across the backend.
 */
export const baseTemplate = ({ title, preheader, content }) => {
  const logoUrl = process.env.LOGO_URL || 'https://res.cloudinary.com/dyrfiop7d/image/upload/v1779801371/cocoveera/branding/ewo6ljdta2dklg9kvbrs.jpg';
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
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #F4F7F4;
      color: #2D3748;
      line-height: 1.6;
    }
    @media only screen and (max-width: 600px) {
      .outer-wrapper { padding: 12px 6px !important; }
      .header-cell { padding: 25px 15px !important; }
      .content-cell { padding: 25px 18px !important; }
      .footer-cell { padding: 20px 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F7F4; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #2D3748; line-height: 1.6;">
  ${preheader ? `<span style="display:none;font-size:1px;color:#2D3748;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  
  <div class="outer-wrapper" style="background-color: #F4F7F4; padding: 40px 12px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
      
      <!-- Top Decorative Accent -->
      <tr>
        <td height="5" style="background: linear-gradient(90deg, #D4A843 0%, #2E7D32 50%, #1E5B2E 100%);"></td>
      </tr>

      <!-- Header Banner with Logo -->
      <tr>
        <td class="header-cell" align="center" style="padding: 35px 25px 30px 25px; background: linear-gradient(180deg, #1E5B2E 0%, #144020 100%); color: #FFFFFF;">
          ${logoUrl ? `
            <div style="margin-bottom: 16px;">
              <img src="${logoUrl}" alt="Cocoveera Logo" style="max-height: 70px; max-width: 220px; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" />
            </div>
          ` : ''}
          <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #FFFFFF;">
            <span style="color: #E2E8F0;">COCO</span><span style="color: #D4A843;">VEERA</span>
          </h1>
          <div style="height: 2px; width: 50px; background-color: #D4A843; margin: 12px auto;"></div>
          <p style="color: #E2E8F0; margin: 0; font-family: 'Georgia', serif; font-style: italic; font-size: 13px; letter-spacing: 0.6px; opacity: 0.95;">
            Premium Organic Coir Substrates & Global Exports
          </p>
        </td>
      </tr>

      <!-- Main Content Body -->
      <tr>
        <td class="content-cell" style="padding: 35px 30px; font-size: 15px; color: #2D3748; line-height: 1.7; background-color: #FFFFFF;">
          ${content}
        </td>
      </tr>

      <!-- Signature Divider -->
      <tr>
        <td class="content-cell" style="padding: 0 30px 30px 30px; background-color: #FFFFFF;">
          <div style="border-top: 1px solid #EDF2F7; padding-top: 24px; display: flex; align-items: center;">
            <div>
              <p style="margin: 0; color: #718096; font-size: 13px; font-style: italic;">Warm regards,</p>
              <p style="margin: 4px 0 0 0; font-family: 'Georgia', serif; color: #1E5B2E; font-size: 16px; font-weight: bold;">
                Cocoveera Customer Support & Export Team
              </p>
              <p style="margin: 2px 0 0 0; color: #D4A843; font-size: 12px; font-weight: 600;">
                Direct Reply: <a href="mailto:supportdesk@cocoveera.com" style="color: #1E5B2E; text-decoration: underline;">supportdesk@cocoveera.com</a>
              </p>
            </div>
          </div>
        </td>
      </tr>

      <!-- Footer Section -->
      <tr>
        <td class="footer-cell" align="center" style="background-color: #F8FAFC; padding: 28px 25px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #718096; line-height: 1.8;">
          <p style="margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: #1E5B2E; font-size: 12px;">
            Cocoveera Global Export Operations
          </p>
          <p style="margin: 0 0 14px 0; color: #4A5568;">
            Coimbatore Export Yard • Hamburg Hub • Los Angeles Operations
          </p>
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto;">
            <tr>
              <td style="padding: 4px 10px; background-color: #EDF7ED; border-radius: 20px; font-weight: bold; color: #1E5B2E; font-size: 10px; text-transform: uppercase;">OMRI Organic Certified</td>
              <td width="8"></td>
              <td style="padding: 4px 10px; background-color: #FFF9E6; border-radius: 20px; font-weight: bold; color: #9B6E00; font-size: 10px; text-transform: uppercase;">100% Peat-Free</td>
              <td width="8"></td>
              <td style="padding: 4px 10px; background-color: #EDF7ED; border-radius: 20px; font-weight: bold; color: #1E5B2E; font-size: 10px; text-transform: uppercase;">ISO 9001 Quality</td>
            </tr>
          </table>

          <p style="margin: 0; color: #A0AEC0;">© ${year} Cocoveera Exports. All rights reserved.</p>
          <p style="margin: 4px 0 0 0; color: #CBD5E0; font-size: 10px;">
            Replies to this email are directed directly to supportdesk@cocoveera.com.
          </p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`;
};
