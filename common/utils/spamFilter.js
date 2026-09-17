import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SPAM_PROMPTS = {
  contact_name: `
You are validating the "name" field of a Contact Us form.

Determine whether the provided value is spam or abusive input.

Mark as spam when it contains things such as:
- advertisements
- URLs or domains
- promotional text
- random repeated characters
- obvious bot-generated garbage
- phishing content
- scripts or injection-like content
- unrelated long messages instead of a person's name

Do not mark ordinary personal names as spam.
`,

  contact_email: `
You are validating the "email" field of a Contact Us form.

Determine whether the provided value appears suspicious or spam-related.

Consider:
- obviously fake or disposable-looking patterns
- promotional text placed instead of an email
- URLs or unrelated content
- phishing or scam content
- random bot-generated garbage

Do not mark a valid-looking normal email address as spam merely because
you do not recognize the domain.
`,

  contact_subject: `
You are validating the "subject" field of a Contact Us form.

Determine whether the subject appears to be spam.

Spam can include:
- unsolicited advertising
- SEO or marketing offers
- fake giveaways
- crypto or investment scams
- phishing attempts
- suspicious links
- repetitive promotional wording
- unrelated bulk outreach
- bot-generated garbage

Normal enquiries, questions, complaints, support requests, and business
communications should not be marked as spam.
`,

  contact_message: `
You are validating the main "message" field of a Contact Us form.

Determine whether the message is spam.

Spam includes:
- unsolicited advertisements
- SEO or backlink offers
- marketing or sales outreach
- phishing attempts
- suspicious links
- scams
- fake giveaways
- crypto or investment schemes
- credential stealing attempts
- repetitive bulk messages
- bot-generated garbage

Legitimate enquiries, questions, complaints, support requests, feedback,
and genuine business communication should not be marked as spam.
`,
};

export async function checkSpam(type, value) {
  if (!type || typeof type !== "string") {
    throw new Error("Spam type is required");
  }

  if (!value || typeof value !== "string") {
    throw new Error("Value must be a non-empty string");
  }

  const prompt = SPAM_PROMPTS[type];

  if (!prompt) {
    throw new Error(`Unsupported spam type: ${type}`);
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",

    instructions: `
${prompt}

Return only the requested structured result.
`,

    input: value,

    text: {
      format: {
        type: "json_schema",
        name: "spam_detection",

        schema: {
          type: "object",

          properties: {
            isSpam: {
              type: "boolean",
            },

            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },

            reason: {
              type: "string",
            },
          },

          required: [
            "isSpam",
            "confidence",
            "reason",
          ],

          additionalProperties: false,
        },

        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text);
}