const CACHE_VERSION = 'claims-pwa-v1';
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;
const API_UPLOAD_PATH = '/api/claims/upload';
const DB_NAME = 'claims-upload-db';
const UPLOAD_STORE = 'queued-uploads';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(UPLOAD_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readAllUploads = async () => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(UPLOAD_STORE, 'readonly');
    const store = tx.objectStore(UPLOAD_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const saveUpload = async (payload) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(UPLOAD_STORE, 'readwrite');
    tx.objectStore(UPLOAD_STORE).put(payload);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const deleteUpload = async (id) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(UPLOAD_STORE, 'readwrite');
    tx.objectStore(UPLOAD_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const serializeFormData = (formData) => {
  const entries = [];
  const hasFile = typeof File !== 'undefined';
  formData.forEach((value, key) => {
    if (hasFile && value instanceof File) {
      entries.push({
        key,
        type: 'file',
        value: {
          name: value.name,
          type: value.type,
          lastModified: value.lastModified,
          blob: value
        }
      });
      return;
    }
    if (value instanceof Blob) {
      entries.push({
        key,
        type: 'blob',
        value: {
          type: value.type,
          blob: value
        }
      });
      return;
    }
    entries.push({ key, type: 'text', value });
  });
  return entries;
};

const rebuildFormData = (serialized) => {
  const formData = new FormData();
  serialized.forEach((entry) => {
    if (entry.type === 'file') {
      const fileData = entry.value;
      formData.append(entry.key, fileData.blob, fileData.name);
      return;
    }
    if (entry.type === 'blob') {
      const blobData = entry.value;
      formData.append(entry.key, blobData.blob);
      return;
    }
    formData.append(entry.key, entry.value);
  });
  return formData;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== OFFLINE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

const handleUploadRequest = async (request) => {
  try {
    return await fetch(request.clone());
  } catch (error) {
    const formData = await request.clone().formData();
    const payload = {
      id: (self.crypto && self.crypto.randomUUID) ? self.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      url: request.url,
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body: serializeFormData(formData),
      queuedAt: Date.now()
    };
    await saveUpload(payload);
    if (self.registration && 'sync' in self.registration) {
      try {
        await self.registration.sync.register('claims-upload-sync');
      } catch (syncError) {
        console.warn('Background sync registration failed.', syncError);
      }
    }
    return new Response(
      JSON.stringify({ queued: true, message: 'Upload queued for background sync.' }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

const replayQueuedUploads = async () => {
  const queued = await readAllUploads();
  for (const entry of queued) {
    try {
      const formData = rebuildFormData(entry.body || []);
      const response = await fetch(entry.url, {
        method: entry.method,
        headers: new Headers(entry.headers || []),
        body: formData
      });
      if (response.ok) {
        await deleteUpload(entry.id);
      }
    } catch (error) {
      console.warn('Retrying queued upload failed.', error);
    }
  }
};

self.addEventListener('sync', (event) => {
  if (event.tag === 'claims-upload-sync') {
    event.waitUntil(replayQueuedUploads());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname.endsWith(API_UPLOAD_PATH)) {
    event.respondWith(handleUploadRequest(request));
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(OFFLINE_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
