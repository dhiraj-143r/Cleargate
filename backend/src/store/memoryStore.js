/**
 * In-memory data store for reports, sessions, and invoices.
 * In production, this would be a database (Postgres via BuildWithLocus addon).
 */

const reports = new Map();
const sessions = new Map();
const invoices = new Map();

module.exports = {
  reports: {
    save: (id, report) => reports.set(id, report),
    get: (id) => reports.get(id) || null,
    getAll: () => Array.from(reports.values()),
    delete: (id) => reports.delete(id),
  },
  sessions: {
    save: (id, session) => sessions.set(id, session),
    get: (id) => sessions.get(id) || null,
    getAll: () => Array.from(sessions.values()),
  },
  invoices: {
    save: (id, invoice) => invoices.set(id, invoice),
    get: (id) => invoices.get(id) || null,
    getAll: () => Array.from(invoices.values()),
  },
};
