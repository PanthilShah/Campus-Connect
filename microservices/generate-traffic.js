/**
 * Traffic Generator & Metrics Demonstrator — Lab 8 (Section 5.3)
 * Generates realistic API traffic through the Gateway to populate Prometheus metrics
 * and visualize rate, latency, 2xx successes, and 4xx/5xx errors in Grafana.
 */

'use strict';

const http = require('http');

const GATEWAY_PORT = process.env.GATEWAY_PORT || 3001;
const HOST = process.env.GATEWAY_HOST || 'localhost';

function request(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const req = http.request(
      {
        hostname: HOST,
        port: GATEWAY_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );
    req.on('error', (err) => {
      resolve({ status: 503, error: err.message });
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTrafficBatch(batchNumber, count = 10) {
  console.log(`\n🚀 [Batch ${batchNumber}] Sending ${count * 5} API requests to http://${HOST}:${GATEWAY_PORT}...`);

  const results = { '2xx': 0, '4xx': 0, '5xx': 0 };

  for (let i = 0; i < count; i++) {
    // 1. Success user lookup
    const r1 = await request('/users');
    tally(r1.status, results);

    // 2. Success user single item
    const r2 = await request('/users/101');
    tally(r2.status, results);

    // 3. Success product lookup
    const r3 = await request('/products');
    tally(r3.status, results);

    // 4. Intended 404 error (Non-existent user/product)
    const r4 = await request(`/users/9999${i}`);
    tally(r4.status, results);

    // 5. Intended 400 validation error (Missing required field)
    const r5 = await request('/users', 'POST', { department: 'Test Dept' });
    tally(r5.status, results);
  }

  console.log(`✅ Batch ${batchNumber} Completed: 2xx Successes: ${results['2xx']}, 4xx Errors: ${results['4xx']}, 5xx Errors: ${results['5xx']}`);
}

function tally(status, results) {
  if (status >= 200 && status < 300) results['2xx']++;
  else if (status >= 400 && status < 500) results['4xx']++;
  else results['5xx']++;
}

async function main() {
  console.log('═'.repeat(65));
  console.log('  📈 CampusConnect Traffic Generator (Prometheus & Grafana)  ');
  console.log(`     Target: http://${HOST}:${GATEWAY_PORT}                  `);
  console.log('═'.repeat(65));

  // Run 2 batches of traffic
  await runTrafficBatch(1, 5);
  await runTrafficBatch(2, 5);

  // Fetch Prometheus metrics from the Gateway
  console.log('\n📊 Fetching live Prometheus metrics from GET /metrics...');
  const metricsRes = await request('/metrics');
  if (metricsRes.status === 200) {
    console.log('\n--- Prometheus Metrics Output Preview ---');
    const lines = metricsRes.body.split('\n').filter(l => !l.startsWith('#') && l.trim().length > 0);
    console.log(lines.slice(0, 15).join('\n'));
    console.log('-----------------------------------------\n');
  }

  console.log('🎉 Traffic simulation complete! Metrics successfully updated in Prometheus/Grafana.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTrafficBatch, request };
