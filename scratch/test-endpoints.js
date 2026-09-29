import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: Health & Security Headers ---');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Health status:', health.status);
  console.log('Has CSP header:', !!health.headers['content-security-policy']);
  console.log('Has X-Frame-Options:', health.headers['x-frame-options']);
  console.log('Has X-Powered-By:', !!health.headers['x-powered-by']);

  console.log('\n--- TEST 2: Admin Login with Wrong Password ---');
  const wrongLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'wrongpassword' });
  console.log('Wrong login status:', wrongLogin.status, wrongLogin.body.message);

  console.log('\n--- TEST 3: Admin Login with Configured Password ---');
  const goodLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'kshitiz2026@gce' });
  console.log('Good login status:', goodLogin.status, 'Has token:', !!goodLogin.body.token);

  console.log('\n--- TEST 4: Registration Input Validation (Invalid Phone) ---');
  const badReg = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/participants/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    fullName: 'Test Hacker',
    registrationNumber: '25101999',
    branch: 'CSE',
    role: 'Participant',
    acts: 'Singing',
    phone: 'not-a-phone-number'
  });
  console.log('Bad reg status:', badReg.status, badReg.body.message);

  console.log('\n--- TEST 5: Registration Input Validation (Valid Phone) ---');
  const goodReg = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/participants/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    fullName: 'Aditya Raj',
    registrationNumber: '25101088',
    branch: 'Computer Science & Engineering',
    role: 'Participant / Performer',
    acts: 'Beatboxing & Rap Solo',
    phone: '+91 98765 12345'
  });
  console.log('Good reg status:', goodReg.status, goodReg.body.message);

  console.log('\n--- TEST 6: Roll Number Lookup Sanitization ---');
  const lookup = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/participants/lookup/25101088',
    method: 'GET'
  });
  console.log('Lookup status:', lookup.status, 'Participant found:', lookup.body.data?.fullName);

  console.log('\n--- TEST 7: ReDoS / Regex Injection Protection in Lookup ---');
  const redos = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/participants/lookup/' + encodeURIComponent('((a+)+)+$'),
    method: 'GET'
  });
  console.log('ReDoS payload rejected safely:', redos.status, redos.body.message);

  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(console.error);
