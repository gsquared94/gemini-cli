import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as https from 'node:https';
import forge from 'node-forge';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client/dist'));

// --- Mock Data Store ---
interface MockResponse {
  statusCode: number;
  body: unknown; // validation error or single response
  chunks?: unknown[]; // for streaming
  delay?: number;
}

interface MockChain {
  endpoint: string;
  method: string;
  responses: MockResponse[];
  currentIndex: number;
}

// Map of "METHOD PATH" -> MockChain
const mockStore: Record<string, MockChain> = {};

// Helper to broadcast logs to UI
// We'll init this later
let broadcastLog: (log: any) => void = () => {};

// --- API Handlers ---

const handleRequest = async (req: express.Request, res: express.Response) => {
  // Normalize path: ignore query params, maybe strip trailing slash
  const path = req.path.replace(/\/$/, '');
  const method = req.method;
  const key = `${method} ${path}`;

  const logEntry: any = {
    timestamp: new Date().toISOString(),
    method,
    path,
    query: req.query,
    body: req.body,
    response: null,
  };

  const chain = mockStore[key];

  if (!chain || chain.responses.length === 0) {
    logEntry.response = { error: 'No mock configured' };
    broadcastLog(logEntry);
    return res.status(404).json({ error: `No mock configured for ${key}` });
  }

  const response = chain.responses[chain.currentIndex];
  chain.currentIndex = (chain.currentIndex + 1) % chain.responses.length;

  if (response.delay) {
    await new Promise((resolve) => setTimeout(resolve, response.delay));
  }

  // Handle SSE (Streaming)
  if (response.chunks && response.chunks.length > 0) {
    res.writeHead(response.statusCode, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    logEntry.response = {
      status: response.statusCode,
      chunks: response.chunks.length,
    };
    broadcastLog(logEntry);

    for (const chunk of response.chunks) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      // simulate delay between chunks if needed?
    }
    res.end();
    return;
  }

  logEntry.response = { status: response.statusCode, body: response.body };
  broadcastLog(logEntry);

  return res.status(response.statusCode).json(response.body);
};

// Register exhaustive list of endpoints
// Note: Some endpoints use :name or other params. We need to be careful with exact matching vs pattern matching.
// Use regex to capture all requests starting with /v1internal
app.all(/^\/v1internal/, handleRequest);

// --- Management API for UI ---

app.get('/api/mocks', (req, res) => {
  res.json(mockStore);
});

app.post('/api/mocks', (req, res) => {
  const { endpoint, method, responses } = req.body;
  const key = `${method} ${endpoint}`; // endpoint should start with /v1internal
  mockStore[key] = {
    endpoint,
    method,
    responses,
    currentIndex: 0,
  };
  res.json({ success: true });
});

app.delete('/api/mocks', (req, res) => {
  // Clear all? or specific?
  // Let's support clearing specific by query param or body
  const { key } = req.body;
  if (key && mockStore[key]) {
    delete mockStore[key];
  } else {
    // Clear all
    for (const k in mockStore) delete mockStore[k];
  }
  res.json({ success: true });
});

// --- SSL Certificate Generation ---
function generateCert() {
  console.log('Generating self-signed certificate...');
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'Virginia' },
    { name: 'localityName', value: 'Blacksburg' },
    { name: 'organizationName', value: 'Test' },
    { shortName: 'OU', value: 'Test' },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  return {
    key: forge.pki.privateKeyToPem(keys.privateKey),
    cert: forge.pki.certificateToPem(cert),
  };
}

const { key, cert } = generateCert();

// --- Load Mocks from File ---
import * as fs from 'node:fs';
import * as path from 'node:path';

function loadMocksFromFile() {
  const args = process.argv.slice(2);
  let mocksFile = process.env.MOCKS_FILE;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mocks' && args[i + 1]) {
      mocksFile = args[i + 1];
      break;
    }
  }

  if (mocksFile) {
    try {
      const absolutePath = path.resolve(mocksFile);
      if (fs.existsSync(absolutePath)) {
        console.log(`Loading mocks from ${absolutePath}...`);
        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        const mocks = JSON.parse(fileContent);

        // Validate and merge into mockStore
        // Assuming file format is same as mockStore: Record<string, MockChain>
        for (const [k, v] of Object.entries(mocks)) {
          mockStore[k] = v as MockChain;
          // Reset index just in case
          mockStore[k].currentIndex = 0;
        }
        console.log(`Loaded ${Object.keys(mocks).length} mocks.`);
      } else {
        console.error(`Mocks file not found: ${absolutePath}`);
      }
    } catch (e) {
      console.error('Failed to load mocks from file:', e);
    }
  }
}

loadMocksFromFile();

// --- Start Server ---
const server = https.createServer({ key, cert }, app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // console.log('Client connected to WebSocket');
});

// Update broadcastLog to use wss
broadcastLog = (log) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'log', data: log }));
    }
  });
};

server.listen(PORT, () => {
  console.log(`GCA Mock Server running at https://localhost:${PORT}`);
  console.log(`Use NODE_TLS_REJECT_UNAUTHORIZED=0 when running client.`);
});
