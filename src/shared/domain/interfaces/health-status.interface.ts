export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    redis: HealthCheck;
    automapper: HealthCheck;
    database: HealthCheck;
    emailProviders: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}
