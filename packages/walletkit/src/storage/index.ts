// Storage module exports

export type { StorageAdapter, StorageConfig, StorageResult, StorageMetrics } from './types';
export { LocalStorageAdapter, MemoryStorageAdapter, createStorageAdapter } from './adapters';
