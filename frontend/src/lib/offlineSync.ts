// import Dexie, { Table } from 'dexie';

export const queueOfflineRequest = async (url, options) => {
  console.log('Offline request queuing disabled');
  return false;
};

export const flushQueuedRequests = async () => {
  console.log('Offline sync disabled');
};

export const startOfflineSync = () => {
  console.log('Offline sync service disabled');
};
