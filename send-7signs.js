exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = (body.email || '').trim().toLowerCase();
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API key' }) };
  }

  const PDF_URL = 'https://knowmamiwata.com/files/7-signs-spiritual-calling.pdf';
  const SITE_URL = 'https://knowmamiwata.com';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f8f8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f8f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0f4c3a;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0f4c3a;padding:40px 40px 20px;text-align:center;border-bottom:2px solid #d4af37;">
          <p style="margin:0 0 8px;color:#3ca9a0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Your Free Guide Is Here</p>
          <h1 style="margin:0;color:#d4af37;font-size:28px;line-height:1.3;">7 Signs of a<br><em>Spiritual Calling</em></h1>
          <p style="margin:12px 0 0;color:rgba(240,248,248,0.8);font-size:14px;">from Amari Zola &middot; knowmamiwata.com</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;color:#f0f8f8;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:rgba(240,248,248,0.9);">
            The water called you here for a reason.
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:rgba(240,248,248,0.8);">
            Your free guide &mdash; <strong style="color:#d4af37;">7 Signs of a Spiritual Calling</strong> &mdash; is attached below. 
            Read it slowly. Sit with each sign. The reflection questions at the end of each section are where the real work begins.
          </p>
          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:28px auto;">
            <tr><td style="background:linear-gradient(135deg,#d4af37,#f1c40f);border-radius:30px;padding:0;">
              <a href="${PDF_URL}" style="display:inline-block;padding:14px 36px;color:#2c3e3f;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;text-decoration:none;">
                📖 Download Your Free Guide
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 8px;font-size:14px;line-height:1.6;color:rgba(240,248,248,0.7);">
            If the signs in this guide resonate with you, the full journey &mdash; initiation, dream mastery, rituals, and living as an initiate &mdash; is waiting for you in the complete book.
          </p>
        </td></tr>
        <!-- Upsell -->
        <tr><td style="background:#1e6b5c;padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;color:#d4af37;font-size:18px;font-style:italic;">Mami Wata: A Journey to Self-Initiation</p>
          <p style="margin:0 0 16px;color:rgba(240,248,248,0.75);font-size:13px;">200+ pages from an actual initiate &bull; Instant PDF download</p>
          <p style="margin:0 0 4px;color:rgba(240,248,248,0.45);font-size:13px;text-decoration:line-through;">$199</p>
          <p style="margin:0 0 16px;color:#f1c40f;font-size:22px;font-weight:bold;">$98 today</p>
          <a href="${SITE_URL}/#buy-now" style="display:inline-block;background:transparent;border:2px solid #d4af37;border-radius:30px;padding:10px 28px;color:#d4af37;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;">
            Get the Full Book &rarr;
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;text-align:center;background:#0a2e22;">
          <p style="margin:0;color:rgba(240,248,248,0.4);font-size:11px;line-height:1.6;">
            &copy; ${new Date().getFullYear()} knowmamiwata.com &bull; You received this because you requested the free guide.<br>
            No spam, ever. <a href="${SITE_URL}/privacy-policy.html" style="color:#3ca9a0;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Amari Zola <hello@knowmamiwata.com>',
        to: [email],
        subject: 'Your Free Guide: 7 Signs of a Spiritual Calling 🌊',
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Email delivery failed' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch(err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
