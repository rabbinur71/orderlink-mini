import { Request, Response } from 'express';

export function facebookWebhook(req: Request, res: Response) {
  // Basic stub: accept POST body and respond 200 quickly.
  // In Step 6 we'll add idempotency & verification.
  console.log('FB webhook payload:', JSON.stringify(req.body));
  return res.status(200).json({ received: true });
}