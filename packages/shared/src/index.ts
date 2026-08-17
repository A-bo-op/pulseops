export type MonitorStatus = 'UP' | 'DOWN' | 'PENDING';
export type IncidentStatus = 'OPEN' | 'RESOLVED';
export type HttpMethod = 'GET' | 'HEAD';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  monitorCount: number;
  upCount: number;
  downCount: number;
}

export interface MonitorSummary {
  monitorId: string;
  currentStatus: MonitorStatus;
  responseTimeMs: number | null;
  uptimePercentage: number;
  lastCheckedAt: string | null;
}
