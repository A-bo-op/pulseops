export interface CheckResult {
  id: string;
  statusCode: number | null;
  responseTimeMs: number;
  isUp: boolean;
  errorType: string | null;
  errorMessage: string | null;
  checkedAt: string;
  monitor?: { id: string; name: string };
}

export interface Incident {
  id: string;
  status: 'OPEN' | 'RESOLVED';
  failureReason: string;
  startedAt: string;
  resolvedAt: string | null;
  monitor: {
    id: string;
    name: string;
    url: string;
    project?: { id: string; name: string };
    checkResults?: CheckResult[];
  };
}

export interface Monitor {
  id: string;
  projectId: string;
  name: string;
  url: string;
  httpMethod: 'GET' | 'HEAD';
  intervalSeconds: number;
  timeoutMs: number;
  expectedStatusCode: number;
  isActive: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
  project?: { id: string; name: string; userId: string };
  checkResults: CheckResult[];
  incidents: Incident[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  monitorCount: number;
  upCount: number;
  downCount: number;
  monitors: Monitor[];
}

export interface DashboardData {
  metrics: {
    totalMonitors: number;
    monitorsUp: number;
    monitorsDown: number;
    pendingMonitors: number;
    openIncidents: number;
    averageResponseTimeMs: number;
  };
  monitors: Monitor[];
  recentIncidents: Array<Omit<Incident, 'monitor'> & { monitor: { id: string; name: string } }>;
  recentChecks: CheckResult[];
}

export interface MonitorAnalytics {
  monitorId: string;
  currentStatus: 'UP' | 'DOWN' | 'PENDING';
  responseTimeMs: number | null;
  uptimePercentage: number;
  averageResponseTimeMs: number;
  lastCheckedAt: string | null;
  totalChecks: number;
}
