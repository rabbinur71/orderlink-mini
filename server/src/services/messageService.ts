import db from './db';

export type MessageLogRow = {
  id: number;
  order_id?: string | null;
  channel: string;
  payload: any;
  status: string;
  response?: string | null;
  attempts?: number;
  created_at?: string;
  updated_at?: string;
  last_attempt_at?: string | null;
};

/**
 * Enqueue a message log row. Returns inserted row.
 */
export async function enqueueMessage(
  trxOrDb: any,
  params: {
    order_id?: string | null;
    channel: string;
    payload: any;
  }
) {
  const row = {
    order_id: params.order_id ?? null,
    channel: params.channel,
    payload: params.payload,
    status: 'queued',
    response: null,
    attempts: 0,
    created_at: trxOrDb.fn.now(),
    updated_at: trxOrDb.fn.now(),
  };
  const [inserted] = await trxOrDb('message_logs').insert(row).returning('*');
  return inserted as MessageLogRow;
}

/**
 * Fetch a batch of queued messages and lock them for processing using SKIP LOCKED.
 * Returns an array of rows (raw DB rows).
 */
export async function fetchAndLockQueued(trx: any, limit = 5) {
  // This uses Postgres SKIP LOCKED pattern via knex
  const rows = await trx('message_logs')
    .select('*')
    .where({ status: 'queued' })
    .orderBy('created_at', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked();

  return rows as MessageLogRow[];
}

/**
 * Mark a message as processing (increase attempts and set last_attempt_at)
 */
export async function markProcessing(trxOrDb: any, id: number) {
  const [updated] = await trxOrDb('message_logs')
    .where({ id })
    .update({
      status: 'processing',
      attempts: db.raw('attempts + 1'),
      last_attempt_at: db.fn.now(),
      updated_at: db.fn.now()
    })
    .returning('*');
  return updated as MessageLogRow;
}

export async function markSent(trxOrDb: any, id: number, response: any) {
  const [updated] = await trxOrDb('message_logs')
    .where({ id })
    .update({
      status: 'sent',
      response: typeof response === 'string' ? response : JSON.stringify(response),
      updated_at: db.fn.now()
    })
    .returning('*');
  return updated as MessageLogRow;
}

export async function markFailed(trxOrDb: any, id: number, response: any) {
  const [updated] = await trxOrDb('message_logs')
    .where({ id })
    .update({
      status: 'failed',
      response: typeof response === 'string' ? response : JSON.stringify(response),
      updated_at: db.fn.now()
    })
    .returning('*');
  return updated as MessageLogRow;
}