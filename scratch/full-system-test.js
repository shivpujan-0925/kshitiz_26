// Comprehensive Product-Level Integration Test Suite for ASTRA_26 / Kshitiz 2025
const baseUrl = 'http://localhost:5000';
const adminPass = process.env.ADMIN_PASSWORD || 'kshitiz2026@gce';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('🚀 STARTING COMPREHENSIVE ASTRA 2026 SYSTEM VERIFICATION');
  console.log('========================================================\n');

  // TEST 1: Public Core Endpoints
  console.log('--- TEST GROUP 1: PUBLIC CORE DATA ENDPOINTS ---');
  try {
    const health = await fetch(`${baseUrl}/api/health`).then(r => r.json());
    assert(health.status === 'ok' && (health.event?.includes('25') || health.event?.includes('26')), 'GET /api/health returns status ok');

    const settings = await fetch(`${baseUrl}/api/settings`).then(r => r.json());
    assert(settings.success && settings.data?.themeName, 'GET /api/settings returns event configurations');

    const schedule = await fetch(`${baseUrl}/api/schedule`).then(r => r.json());
    assert(schedule.success && Array.isArray(schedule.data), 'GET /api/schedule returns valid timeline array');

    const posters = await fetch(`${baseUrl}/api/posters`).then(r => r.json());
    assert(posters.success && Array.isArray(posters.data), 'GET /api/posters returns active posters array');

    const gallery = await fetch(`${baseUrl}/api/gallery`).then(r => r.json());
    assert(gallery.success && Array.isArray(gallery.data), 'GET /api/gallery returns party glimpses');

    const announcements = await fetch(`${baseUrl}/api/announcements`).then(r => r.json());
    assert(announcements.success && Array.isArray(announcements.data), 'GET /api/announcements returns news feed');

    const cheers = await fetch(`${baseUrl}/api/hype-cheers`).then(r => r.json());
    assert(cheers.success && Array.isArray(cheers.data), 'GET /api/hype-cheers returns live shoutouts list');
  } catch (err) {
    assert(false, `Public endpoints error: ${err.message}`);
  }

  // TEST 2: Participant Registration & Validation
  console.log('\n--- TEST GROUP 2: PARTICIPANT REGISTRATION & VALIDATION ---');
  let registeredParticipantId = null;
  const testRoll = `TEST${Date.now()}`;
  try {
    // 2a: Valid registration with Role
    const regRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Arjun Verma',
        registrationNumber: testRoll,
        branch: 'CSE',
        role: 'Participant / Performer',
        acts: 'Beatboxing & Solo Rap Anthem',
        phone: '+91 98765 43210'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.data.role === 'Participant / Performer', 'POST /api/register creates valid participant with assigned role');
    registeredParticipantId = regData.data._id;

    // 2b: Duplicate roll number rejection
    const dupRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Arjun Verma Duplicate',
        registrationNumber: testRoll,
        branch: 'CSE',
        role: 'General Attendee',
        acts: 'Audience Cheer',
        phone: '+91 98765 43210'
      })
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400 && dupData.success === false, 'POST /api/register rejects duplicate registration number');

    // 2c: Invalid phone format rejection
    const badPhoneRes = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bad Phone User',
        registrationNumber: `BAD${Date.now()}`,
        branch: 'ECE',
        role: 'General Attendee',
        acts: 'Attending',
        phone: 'invalid-phone-string-xyz'
      })
    });
    assert(badPhoneRes.status === 400, 'POST /api/register rejects invalid phone number');
  } catch (err) {
    assert(false, `Registration test error: ${err.message}`);
  }

  // TEST 3: Hype Wall & XSS Sanitization
  console.log('\n--- TEST GROUP 3: HYPE WALL, LIKES & XSS SANITIZATION ---');
  let testShoutoutId = null;
  try {
    const xssPayload = 'Hello <script>alert("hacked")</script><b>world</b>';
    const cheerRes = await fetch(`${baseUrl}/api/hype-cheers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Safe User <script>steal()</script>',
        batch: 'Batch 2025–29',
        branch: 'EE',
        message: xssPayload
      })
    });
    const cheerData = await cheerRes.json();
    testShoutoutId = cheerData.data._id;
    const isXssClean = !cheerData.data.message.includes('<script>') && !cheerData.data.name.includes('<script>');
    assert(cheerRes.status === 201 && isXssClean, 'POST /api/hype-cheers successfully sanitizes XSS injection payloads');

    // Like shoutout
    const likeRes = await fetch(`${baseUrl}/api/hype-cheers/${testShoutoutId}/like`, { method: 'POST' });
    const likeData = await likeRes.json();
    assert(likeRes.status === 200 && likeData.likes >= 2, 'POST /api/hype-cheers/:id/like increments heart count');

    // Royalty cheer
    const royRes = await fetch(`${baseUrl}/api/royalty/cheer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'mrFresher' })
    });
    const royData = await royRes.json();
    assert(royRes.status === 200 && royData.count > 0, 'POST /api/royalty/cheer casts verified vote');
  } catch (err) {
    assert(false, `Hype wall test error: ${err.message}`);
  }

  // TEST 4: Admin Authentication & Timing Safety
  console.log('\n--- TEST GROUP 4: ADMIN AUTHENTICATION & ACCESS CONTROL ---');
  let adminToken = '';
  try {
    // 4a: Wrong password rejection
    const failRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword123' })
    });
    assert(failRes.status === 401, 'POST /api/admin/login rejects incorrect password with 401');

    // 4b: Correct password login
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: adminPass })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'POST /api/admin/login succeeds and returns JWT');
    adminToken = loginData.token;

    // 4c: Block unauthenticated access to admin routes
    const unauthDash = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert(unauthDash.status === 401, 'GET /api/admin/dashboard requires Bearer authorization header');

    // 4d: Authenticated access to admin dashboard
    const authHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
    const authDash = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: authHeaders }).then(r => r.json());
    assert(authDash.success && authDash.stats?.totalRegistrations >= 1, 'GET /api/admin/dashboard returns protected analytics stats');
  } catch (err) {
    assert(false, `Admin auth error: ${err.message}`);
  }

  // TEST 5: Admin CRUD Operations & Deletions
  console.log('\n--- TEST GROUP 5: ADMIN MANAGEMENT & DELETION ACTIONS ---');
  const authHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
  try {
    // 5a: Admin delete shoutout
    if (testShoutoutId) {
      const delCheerRes = await fetch(`${baseUrl}/api/admin/hype-cheers/${testShoutoutId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const delCheerData = await delCheerRes.json();
      assert(delCheerRes.status === 200 && delCheerData.success, 'DELETE /api/admin/hype-cheers/:id successfully deletes shoutout');
    }

    // 5b: Admin schedule item creation, update, delete
    const newSlotRes = await fetch(`${baseUrl}/api/admin/schedule`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        time: '11:30 PM',
        title: 'Midnight Starlight Jam',
        category: 'Acoustic Jam',
        venue: 'Campus Lawn',
        description: 'Unplugged acoustic jam under the stars',
        order: 15,
        highlight: true
      })
    });
    const newSlotData = await newSlotRes.json();
    assert(newSlotRes.status === 201 && newSlotData.data?._id, 'POST /api/admin/schedule creates schedule item');
    const slotId = newSlotData.data?._id;

    if (slotId) {
      const putSlot = await fetch(`${baseUrl}/api/admin/schedule/${slotId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ title: 'Midnight Starlight Jam (Extended)' })
      }).then(r => r.json());
      assert(putSlot.success && putSlot.data?.title?.includes('Extended'), 'PUT /api/admin/schedule/:id updates schedule slot');

      const delSlot = await fetch(`${baseUrl}/api/admin/schedule/${slotId}`, {
        method: 'DELETE',
        headers: authHeaders
      }).then(r => r.json());
      assert(delSlot.success, 'DELETE /api/admin/schedule/:id deletes schedule slot');
    }

    // 5c: Admin announcement create and delete
    const annPostRes = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Emergency Dress Rehearsal Notice',
        content: 'All ramp walkers gather backstage at 3:30 PM sharp.',
        tag: 'Urgent'
      })
    }).then(r => r.json());
    assert(annPostRes.success && annPostRes.data?._id, 'POST /api/admin/announcements creates live broadcast notice');
    
    if (annPostRes.data?._id) {
      const delAnn = await fetch(`${baseUrl}/api/admin/announcements/${annPostRes.data._id}`, {
        method: 'DELETE',
        headers: authHeaders
      }).then(r => r.json());
      assert(delAnn.success, 'DELETE /api/admin/announcements/:id removes announcement');
    }

    // 5d: Admin delete participant
    if (registeredParticipantId) {
      const delPart = await fetch(`${baseUrl}/api/admin/participants/${registeredParticipantId}`, {
        method: 'DELETE',
        headers: authHeaders
      }).then(r => r.json());
      assert(delPart.success, 'DELETE /api/admin/participants/:id deletes participant registration');
    }

    // 5e: Admin settings update
    const settRes = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        googleDriveLink: 'https://drive.google.com/drive/folders/Kshitiz2026_Photos_Master',
        instagramLink: 'https://instagram.com/gce_gaya_official'
      })
    }).then(r => r.json());
    assert(settRes.success, 'POST /api/admin/settings updates master drive & social configurations');
  } catch (err) {
    assert(false, `Admin CRUD operations error: ${err.message}`);
  }

  console.log('\n========================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
