import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp up from 1 to 20 users over 1 minute
    { duration: '3m', target: 50 },  // Maintain a steady load of 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Spike to 100 users for a stress-test window
    { duration: '1m', target: 0 },   // Ramp down smoothly back to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],   // Absolute maximum allowed error rate is 2%
    http_req_duration: ['p(95)<500'], // 95% of server responses must return within 500ms
  },
};

export default function () {
  // Replace with your Let's Encrypt secured application domain or public IP
  const BASE_URL = 'https://yourdomain.com'; 

  // Test Step 1: Hit the Health check endpoint
  let res1 = http.get(`${BASE_URL}/`);
  check(res1, {
    'homepage status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Test Step 2: Call the operational backend S3 backup routine
  let res2 = http.post(`${BASE_URL}/backup`);
  check(res2, {
    'backup transaction successful': (r) => r.status === 200,
  });
  sleep(2);
}
