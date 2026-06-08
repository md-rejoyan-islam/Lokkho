// Branded, responsive HTML email templates (inline styles for client compatibility).

const BRAND = "#2563eb";
const BRAND_DARK = "#1d4ed8";

interface TemplateInput {
  heading: string;
  intro: string;
  buttonText: string;
  buttonUrl: string;
  footnote?: string;
}

interface Email {
  subject: string;
  html: string;
  text: string;
}

function baseTemplate({ heading, intro, buttonText, buttonUrl, footnote }: TemplateInput): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND},${BRAND_DARK});padding:24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,.18);width:40px;height:40px;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">📚</td>
                  <td style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:700;">Lokkho</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;font-weight:700;">${heading}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">${intro}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:10px;background-color:${BRAND};">
                    <a href="${buttonUrl}" target="_blank"
                       style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                       ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">বাটন কাজ না করলে এই লিংকটি কপি করুন:</p>
              <p style="margin:0 0 20px;font-size:13px;word-break:break-all;">
                <a href="${buttonUrl}" target="_blank" style="color:${BRAND};text-decoration:underline;">${buttonUrl}</a>
              </p>
              ${footnote ? `<p style="margin:0;padding-top:16px;border-top:1px solid #f1f5f9;font-size:13px;color:#94a3b8;">${footnote}</p>` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;background-color:#f8fafc;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} Lokkho — চাকরির প্রস্তুতি ব্যবস্থাপনা।<br/>
                এই ইমেইলটি স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে, উত্তর দেওয়ার প্রয়োজন নেই।
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmail(link: string): Email {
  return {
    subject: "আপনার Lokkho ইমেইল যাচাই করুন",
    html: baseTemplate({
      heading: "ইমেইল যাচাই করুন",
      intro:
        "Lokkho-এ স্বাগতম! আপনার অ্যাকাউন্ট সক্রিয় করতে নিচের বাটনে ক্লিক করে ইমেইল ঠিকানা যাচাই করুন।",
      buttonText: "ইমেইল যাচাই করুন",
      buttonUrl: link,
      footnote: "এই লিংকটি ২৪ ঘণ্টা পর মেয়াদোত্তীর্ণ হবে। আপনি অ্যাকাউন্ট তৈরি না করে থাকলে এই ইমেইল উপেক্ষা করুন।",
    }),
    text: `Lokkho-এ স্বাগতম!\nআপনার ইমেইল যাচাই করুন: ${link}\n(লিংকটি ২৪ ঘণ্টা পর মেয়াদোত্তীর্ণ হবে।)`,
  };
}

export function resetPasswordEmail(link: string): Email {
  return {
    subject: "আপনার Lokkho পাসওয়ার্ড রিসেট করুন",
    html: baseTemplate({
      heading: "পাসওয়ার্ড রিসেট",
      intro:
        "আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার অনুরোধ পাওয়া গেছে। নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন।",
      buttonText: "পাসওয়ার্ড রিসেট করুন",
      buttonUrl: link,
      footnote: "এই লিংকটি ১ ঘণ্টা পর মেয়াদোত্তীর্ণ হবে। আপনি এই অনুরোধ না করে থাকলে নিরাপদে এই ইমেইল উপেক্ষা করুন।",
    }),
    text: `পাসওয়ার্ড রিসেট করুন: ${link}\n(লিংকটি ১ ঘণ্টা পর মেয়াদোত্তীর্ণ হবে। আপনি অনুরোধ না করলে উপেক্ষা করুন।)`,
  };
}
