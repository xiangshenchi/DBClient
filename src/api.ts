import { DBConnection, PingResult, QueryResult, StructureResult } from './types.ts';

export async function pingConnection(config: DBConnection): Promise<PingResult> {
  const res = await fetch('/api/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}

export async function executeQuery(config: DBConnection, sql: string): Promise<QueryResult> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, sql })
  });
  return res.json();
}

export async function getDatabaseStructure(config: DBConnection): Promise<StructureResult> {
  const res = await fetch('/api/structure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}
