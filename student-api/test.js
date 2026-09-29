/**
 * Automated Test Suite for Lab 3 Student REST API
 * Tests all CRUD operations, validation rules, HTTP status codes, and Swagger UI.
 */

const http = require('http');
const app = require('./server');

const TEST_PORT = 3099;
let server;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Lab 3 Student REST API Test Suite ---\n');
  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Root discovery endpoint
    const resRoot = await makeRequest({ method: 'GET', path: '/' });
    assert('GET / -> Status 200 OK', resRoot.status === 200);
    assert('GET / -> Returns service metadata', resRoot.body.service.includes('CampusConnect'));

    // 2. Swagger docs endpoint
    const resDocs = await makeRequest({ method: 'GET', path: '/openapi.json' });
    assert('GET /openapi.json -> Status 200 OK', resDocs.status === 200);
    assert('GET /openapi.json -> Returns OpenAPI 3.0 info', resDocs.body.openapi === '3.0.0');

    // 3. GET all students
    const resGetAll = await makeRequest({ method: 'GET', path: '/students' });
    assert('GET /students -> Status 200 OK', resGetAll.status === 200);
    assert('GET /students -> Returns array of students', Array.isArray(resGetAll.body.data) && resGetAll.body.count >= 4);
    assert('GET /students -> Contains Panthil Shah', resGetAll.body.data.some(s => s.name === 'Panthil Shah'));

    // 4. GET student by ID
    const resGetOne = await makeRequest({ method: 'GET', path: '/students/MScIT-25-001' });
    assert('GET /students/MScIT-25-001 -> Status 200 OK', resGetOne.status === 200);
    assert('GET /students/MScIT-25-001 -> Correct student returned', resGetOne.body.data.name === 'Panthil Shah');

    // 5. GET student with non-existent ID (404 test)
    const resGetNotFound = await makeRequest({ method: 'GET', path: '/students/INVALID-999' });
    assert('GET /students/INVALID-999 -> Status 404 Not Found', resGetNotFound.status === 404);
    assert('GET /students/INVALID-999 -> Error response structure', resGetNotFound.body.success === false);

    // 6. POST valid new student (201 test)
    const newStudentData = {
      name: 'Tanvi Patel',
      email: 'tanvi.patel@dau.ac.in',
      course: 'M.Sc. Information Technology',
      semester: 3
    };
    const resPost = await makeRequest({ method: 'POST', path: '/students' }, newStudentData);
    assert('POST /students -> Status 201 Created', resPost.status === 201);
    assert('POST /students -> Created student has generated ID', !!resPost.body.data.id);
    assert('POST /students -> Correct name returned', resPost.body.data.name === 'Tanvi Patel');
    const createdId = resPost.body.data.id;

    // 7. POST invalid student (400 validation failure test)
    const invalidStudentData = {
      name: '',
      email: 'invalid-email-format',
      course: 'M.Sc. IT',
      semester: -2
    };
    const resPostInvalid = await makeRequest({ method: 'POST', path: '/students' }, invalidStudentData);
    assert('POST /students (invalid data) -> Status 400 Bad Request', resPostInvalid.status === 400);
    assert('POST /students (invalid data) -> Returns validation error details', Array.isArray(resPostInvalid.body.details) && resPostInvalid.body.details.length >= 2);

    // 8. PUT update existing student (200 test)
    const updateData = {
      name: 'Tanvi Patel',
      email: 'tanvi.patel@dau.ac.in',
      course: 'M.Sc. Information Technology',
      semester: 4
    };
    const resPut = await makeRequest({ method: 'PUT', path: `/students/${createdId}` }, updateData);
    assert(`PUT /students/${createdId} -> Status 200 OK`, resPut.status === 200);
    assert(`PUT /students/${createdId} -> Updated semester to 4`, resPut.body.data.semester === 4);

    // 9. PUT non-existent student (404 test)
    const resPutNotFound = await makeRequest({ method: 'PUT', path: '/students/NOTFOUND-404' }, updateData);
    assert('PUT /students/NOTFOUND-404 -> Status 404 Not Found', resPutNotFound.status === 404);

    // 10. DELETE existing student (200 test)
    const resDelete = await makeRequest({ method: 'DELETE', path: `/students/${createdId}` });
    assert(`DELETE /students/${createdId} -> Status 200 OK`, resDelete.status === 200);
    assert(`DELETE /students/${createdId} -> Returns deleted student entity`, resDelete.body.deleted.name === 'Tanvi Patel');

    // 11. DELETE non-existent student (404 test)
    const resDeleteNotFound = await makeRequest({ method: 'DELETE', path: `/students/${createdId}` });
    assert(`DELETE /students/${createdId} (again) -> Status 404 Not Found`, resDeleteNotFound.status === 404);

    // 12. 404 on unhandled routes
    const resUnknown = await makeRequest({ method: 'GET', path: '/unknown/route' });
    assert('GET /unknown/route -> Status 404 Route Not Found', resUnknown.status === 404);

    console.log(`\n=============================================================`);
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log(`=============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

server = app.listen(TEST_PORT, () => {
  runTests();
});
