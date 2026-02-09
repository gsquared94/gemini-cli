import { spawn } from 'child_process';
import * as https from 'https';
import * as http from 'http';

// Configuration
const MOCK_SERVER_URL = 'https://localhost:3000';
const CLI_CMD = 'node bundle/gemini.js'; // Adjust path if needed
const PROJECT_ROOT = process.cwd();

// Helper to make requests to Mock Server (ignoring SSL)
const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${MOCK_SERVER_URL}${path}`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : {},
          }),
        );
      },
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log('Starting Mock Server...');
  const server = spawn('npm', ['start'], {
    cwd: 'tools/gca-mock',
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' },
  });

  // Wait for server to be up
  await sleep(5000);

  try {
    console.log('Configuring Mocks...');

    // Mock loadCodeAssist
    await request('POST', '/api/mocks', {
      endpoint: '/v1internal:loadCodeAssist',
      method: 'POST',
      responses: [
        {
          statusCode: 200,
          body: {
            currentTier: { id: 'standard-tier' },
            cloudaicompanionProject: 'test-project',
          },
        },
      ],
    });

    // Mock listExperiments
    await request('POST', '/api/mocks', {
      endpoint: '/v1internal:listExperiments',
      method: 'POST',
      responses: [
        {
          statusCode: 200,
          body: { experimentIds: [] },
        },
      ],
    });

    // Mock generateContent
    await request('POST', '/api/mocks', {
      endpoint: '/v1internal:generateContent',
      method: 'POST',
      responses: [
        {
          statusCode: 200,
          body: {
            response: {
              candidates: [
                {
                  content: {
                    parts: [{ text: 'Mocked Response from GCA Server!' }],
                  },
                },
              ],
            },
          },
        },
      ],
    });

    // Mock streamGenerateContent
    await request('POST', '/api/mocks', {
      endpoint: '/v1internal:streamGenerateContent',
      method: 'POST',
      responses: [
        {
          statusCode: 200,
          chunks: [
            {
              response: {
                candidates: [
                  {
                    content: {
                      parts: [{ text: 'Mocked Response from GCA Server!' }],
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    console.log(
      'Mocks configured for loadCodeAssist, listExperiments, generateContent, and streamGenerateContent.',
    );

    console.log('Running Gemini CLI...');
    const cli = spawn('node', ['bundle/gemini.js', 'prompt', 'Hello'], {
      env: {
        ...process.env,
        CODE_ASSIST_ENDPOINT: MOCK_SERVER_URL,
        NODE_TLS_REJECT_UNAUTHORIZED: '0',
      },
      cwd: PROJECT_ROOT,
    });

    let cliOutput = '';
    cli.stdout.on('data', (data) => {
      process.stdout.write(data);
      cliOutput += data.toString();
    });
    cli.stderr.on('data', (data) => process.stderr.write(data));

    await new Promise((resolve) => cli.on('close', resolve));

    if (cliOutput.includes('Mocked Response from GCA Server!')) {
      console.log('\nSUCCESS: CLI received mocked response.');
    } else {
      console.error('\nFAILURE: CLI did not receive expected response.');
      process.exit(1);
    }
  } catch (e) {
    console.error('Error during verification:', e);
    process.exit(1);
  } finally {
    server.kill();
  }
}

run();
