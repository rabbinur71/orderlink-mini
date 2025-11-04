import db from '../services/db';
import { fetchAndLockQueued, markProcessing, markSent, markFailed } from '../services/messageService';

// Configuration
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_MS || 3000); // 3s default
const BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE || 5);
const MAX_RETRIES = Number(process.env.WORKER_MAX_RETRIES || 5);

// Simulate sending: returns { ok: boolean, info: any }
async function simulateSendMessage(row: any) {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500));
  // Simulate success probability (e.g., 92% success)
  const success = Math.random() < 0.92;
  if (success) {
    return { ok: true, info: { provider_id: `sim-${Math.floor(Math.random() * 90000) + 10000}` } };
  } else {
    return { ok: false, info: { reason: 'simulated_failure' } };
  }
}

async function processBatch() {
  // Start a transaction to fetch & lock rows
  const trx = await db.transaction();
  try {
    const rows = await fetchAndLockQueued(trx, BATCH_SIZE);
    if (!rows || rows.length === 0) {
      await trx.commit();
      return 0;
    }

    for (const row of rows) {
      try {
        // mark processing (increment attempts)
        const processing = await markProcessing(trx, row.id);
        // simulate send
        const result = await simulateSendMessage(processing);

        if (result.ok) {
          await markSent(trx, row.id, result.info);
          console.log(`[worker] Sent message id=${row.id} channel=${row.channel} order=${row.order_id}`);
        } else {
          // if reached max attempts -> mark failed, else set back to queued (so it can be picked next loop)
          const attempts = (processing.attempts || 1);
          if (attempts >= MAX_RETRIES) {
            await markFailed(trx, row.id, result.info);
            console.warn(`[worker] Message id=${row.id} failed permanently after ${attempts} attempts`);
          } else {
            // set back to queued so it will be picked later; we update attempts and last_attempt_at already done in markProcessing
            await trx('message_logs').where({ id: row.id }).update({ status: 'queued', updated_at: db.fn.now() });
            console.warn(`[worker] Message id=${row.id} failed attempt ${attempts}, will retry`);
          }
        }
      } catch (err) {
        console.error('[worker] processing row error', err);
        // on per-row error, try to mark failed to avoid stuck processing state
        try {
          await markFailed(trx, row.id, { error: String(err) });
        } catch (e) {
          console.error('[worker] failed to markFailed', e);
        }
      }
    }

    await trx.commit();
    return rows.length;
  } catch (err) {
    console.error('[worker] transaction error', err);
    try { await trx.rollback(); } catch {}
    return 0;
  }
}

async function mainLoop() {
  console.log('[worker] starting message worker. poll interval ms=', POLL_INTERVAL_MS);
  while (true) {
    try {
      const processed = await processBatch();
      if (processed === 0) {
        // no work: wait a bit longer
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      } else {
        // if we processed something, small delay before next batch to avoid tight-loop
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('[worker] main loop error', err);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
}

if (require.main === module) {
  mainLoop().catch((err) => {
    console.error('[worker] fatal error', err);
    process.exit(1);
  });
}

export { mainLoop };