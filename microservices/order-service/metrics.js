/**
 * CampusConnect - Prometheus Metrics Exporter (Lab 8 Part C)
 * Standard Prometheus text format metrics exporter.
 */

'use strict';

class MetricsCollector {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.startTime = Date.now();
    this.requestCounts = new Map();
    this.requestDurations = [];
    this.activeRequests = 0;
  }

  middleware() {
    return (req, res, next) => {
      if (req.path === '/metrics') return next();

      const start = Date.now();
      this.activeRequests++;

      res.on('finish', () => {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        const durationSec = (Date.now() - start) / 1000;
        this.requestDurations.push(durationSec);
        if (this.requestDurations.length > 1000) this.requestDurations.shift();

        const route = this.normalizeRoute(req.baseUrl + req.path);
        const key = `${req.method}|${route}|${res.statusCode}`;
        const current = this.requestCounts.get(key) || 0;
        this.requestCounts.set(key, current + 1);
      });

      next();
    };
  }

  normalizeRoute(path) {
    if (!path || path === '') return '/';
    return path
      .replace(/\/(ORD-\d+|\d+)/g, '/:id')
      .replace(/\/health$/, '/health')
      .replace(/\/services$/, '/services')
      .replace(/\/metrics$/, '/metrics') || '/';
  }

  getMetricsText() {
    const uptime = (Date.now() - this.startTime) / 1000;
    const lines = [];

    lines.push(`# HELP up Health and availability of the ${this.serviceName} service`);
    lines.push(`# TYPE up gauge`);
    lines.push(`up{service="${this.serviceName}"} 1`);
    lines.push('');

    lines.push(`# HELP process_uptime_seconds Total uptime of ${this.serviceName} process in seconds`);
    lines.push(`# TYPE process_uptime_seconds gauge`);
    lines.push(`process_uptime_seconds{service="${this.serviceName}"} ${uptime.toFixed(2)}`);
    lines.push('');

    lines.push(`# HELP http_requests_total Total number of HTTP requests processed by ${this.serviceName}`);
    lines.push(`# TYPE http_requests_total counter`);
    if (this.requestCounts.size === 0) {
      lines.push(`http_requests_total{service="${this.serviceName}",method="GET",route="/",status="200"} 0`);
    } else {
      for (const [key, count] of this.requestCounts.entries()) {
        const [method, route, status] = key.split('|');
        lines.push(`http_requests_total{service="${this.serviceName}",method="${method}",route="${route}",status="${status}"} ${count}`);
      }
    }
    lines.push('');

    const totalDuration = this.requestDurations.reduce((a, b) => a + b, 0);
    const count = this.requestDurations.length;
    lines.push(`# HELP http_request_duration_seconds HTTP request latency summary in seconds`);
    lines.push(`# TYPE http_request_duration_seconds summary`);
    lines.push(`http_request_duration_seconds_sum{service="${this.serviceName}"} ${totalDuration.toFixed(4)}`);
    lines.push(`http_request_duration_seconds_count{service="${this.serviceName}"} ${count}`);
    lines.push('');

    lines.push(`# HELP http_active_requests Current in-flight requests in ${this.serviceName}`);
    lines.push(`# TYPE http_active_requests gauge`);
    lines.push(`http_active_requests{service="${this.serviceName}"} ${this.activeRequests}`);
    lines.push('');

    return lines.join('\n');
  }

  metricsHandler() {
    return (_req, res) => {
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(this.getMetricsText());
    };
  }
}

module.exports = { MetricsCollector };
