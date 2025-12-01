export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

export enum SecurityLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  BREACH = 'BREACH',
  CRITICAL = 'CRITICAL'
}

export interface NodeData {
  id: string;
  status: 'active' | 'compromised' | 'offline';
  val: number;
}

export interface LinkData {
  source: string;
  target: string;
}