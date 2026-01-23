import Dexie, { Table } from 'dexie';

type OfflineRequest = {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  bodyType: 'none' | 'text' | 'json' | 'urlencoded' | 'formdata';
  createdAt: string;
};

class OfflineSyncDatabase extends Dexie {
  outbox!: Table<OfflineRequest, number>;

  constructor() {
    super('invoiceUploaderOffline');
    this.version(1).stores({
      outbox: '++id, createdAt, url, method'
    });
  }
}

const db = new OfflineSyncDatabase();

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const isMutation = (method: string) => mutationMethods.has(method.toUpperCase());

const normalizeHeaders = (headers?: HeadersInit) => {
  const normalized: Record<string, string> = {};
  if (!headers) return normalized;
  const headerEntries = new Headers(headers).entries();
  for (const [key, value] of headerEntries) {
    normalized[key] = value;
  }
  return normalized;
};

const serializeBody = (
  body: BodyInit | null | undefined
): { body: string | null; bodyType: OfflineRequest['bodyType'] } | null => {
  if (body == null) {
    return { body: null, bodyType: 'none' };
  }
  if (typeof body === 'string') {
    return { body, bodyType: 'text' };
  }
  if (body instanceof URLSearchParams) {
    return { body: body.toString(), bodyType: 'urlencoded' };
  }
  if (body instanceof FormData) {
    const entries = Array.from(body.entries()).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value];
      }
      return null;
    });
    if (entries.some((entry) => entry === null)) {
      return null;
    }
    return { body: JSON.stringify(entries), bodyType: 'formdata' };
  }
  if (body instanceof Blob) {
    return null;
  }
  try {
    return { body: JSON.stringify(body), bodyType: 'json' };
  } catch {
    return null;
  }
};

const deserializeBody = (request: OfflineRequest): BodyInit | undefined => {
  if (!request.body || request.bodyType === 'none') return undefined;
  if (request.bodyType === 'text') return request.body;
  if (request.bodyType === 'urlencoded') return new URLSearchParams(request.body);
  if (request.bodyType === 'formdata') {
    const formData = new FormData();
    const entries = JSON.parse(request.body) as Array<[string, string]>;
    entries.forEach(([key, value]) => formData.append(key, value));
    return formData;
  }
  if (request.bodyType === 'json') return request.body;
  return undefined;
};

export const queueOfflineRequest = async (url: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  if (!isMutation(method)) return false;

  const serialized = serializeBody(options.body);
  if (!serialized) return false;

  await db.outbox.add({
    url,
    method,
    headers: normalizeHeaders(options.headers),
    body: serialized.body,
    bodyType: serialized.bodyType,
    createdAt: new Date().toISOString()
  });

  return true;
};

export const flushQueuedRequests = async (fetcher: typeof fetch = fetch) => {
  const queued = await db.outbox.orderBy('createdAt').toArray();
  for (const request of queued) {
    try {
      const response = await fetcher(request.url, {
        method: request.method,
        headers: request.headers,
        body: deserializeBody(request)
      });
      if (response.ok) {
        await db.outbox.delete(request.id!);
      }
    } catch (error) {
      console.warn('Offline sync replay failed, will retry later.', error);
      break;
    }
  }
};

export const startOfflineSync = (fetcher: typeof fetch = fetch) => {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', () => {
    void flushQueuedRequests(fetcher);
  });
  void flushQueuedRequests(fetcher);
};
