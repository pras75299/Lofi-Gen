const DB_NAME = "lofigen";
const STORE = "tracks";
const VERSION = 1;

export type StoredTrack = {
  id: string;
  originalName: string;
  fileName: string;
  blob: Blob;
  effects: string | null;
  createdAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB open blocked"));
  });
  return dbPromise;
};

export const saveTrack = async (input: {
  originalName: string;
  fileName: string;
  blob: Blob;
  effects?: string | null;
}): Promise<StoredTrack> => {
  const db = await openDb();
  const record: StoredTrack = {
    id: crypto.randomUUID(),
    originalName: input.originalName,
    fileName: input.fileName,
    blob: input.blob,
    effects: input.effects ?? null,
    createdAt: new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  return record;
};

export const listTracks = async (): Promise<StoredTrack[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const results: StoredTrack[] = [];
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).index("createdAt").openCursor(null, "prev");
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        results.push(cursor.value as StoredTrack);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
};

export const deleteTrack = async (id: string): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};
