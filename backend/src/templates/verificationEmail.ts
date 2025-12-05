const baseStyles = {
    fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#0b1220',
    panel: '#0f172a',
    text: '#e5e7eb',
    muted: '#9ca3af',
    accent: '#22d3ee',
    border: '#1f2937',
    glow: 'rgba(34, 211, 238, 0.18)',
}

export const buildVerificationEmail = (opts: {
    name: string
    code: string
    expiresMinutes: number
}) => {
    const { name, code, expiresMinutes } = opts
    const safeName = name || 'there'

    return `
  <html>
    <body style="margin:0;padding:0;background:${baseStyles.background};font-family:${baseStyles.fontFamily};color:${baseStyles.text};">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:${baseStyles.panel};border:1px solid ${baseStyles.border};border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
              <tr>
                <td style="padding-bottom:8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${baseStyles.muted};">ChatApp</td>
              </tr>
              <tr>
                <td style="font-size:24px;font-weight:700;padding-bottom:12px;letter-spacing:-0.3px;">Confirm your email</td>
              </tr>
              <tr>
                <td style="color:${baseStyles.muted};font-size:15px;line-height:22px;padding-bottom:20px;">
                  Hi ${safeName}, enter the code below to verify your account. This code expires in ${expiresMinutes} minutes.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:8px 0 22px;">
                  <div style="display:inline-block;font-size:30px;font-weight:800;letter-spacing:12px;color:${baseStyles.accent};background:${baseStyles.glow};border:1px solid ${baseStyles.accent};border-radius:14px;padding:16px 22px;">
                    ${code}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="color:${baseStyles.muted};font-size:13px;line-height:20px;">
                  If you did not request this, you can ignore this email.
                </td>
              </tr>
            </table>
            <div style="color:${baseStyles.muted};font-size:12px;line-height:18px;padding-top:14px;">
              Sent by ChatApp · Please do not reply
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
}
