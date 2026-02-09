# GCA Mock Server (@google/gemini-cli-gca-mock)

A standalone mock server for the Gemini Code Assist (GCA) API, designed to help
develop and test the Gemini CLI without requiring access to live endpoints.

This tool provides a local HTTPS server that intercepts GCA API calls and
returns configured mock responses. It features a web-based UI for easy
configuration of mocks using JSON Schemas derived from the core TypeScript
types.

## Features

- **HTTPS Support**: Runs over HTTPS with self-signed certificates (mirroring
  production behavior).
- **Schema-Aware UI**: Configure responses using auto-generated forms based on
  actual API types.
- **Response Chaining**: Define a sequence of responses for a single endpoint to
  simulate complex flows (e.g., success then failure).
- **Streaming Support**: Mocks Server-Sent Events (SSE) for
  `streamGenerateContent`.
- **Live Logs**: View incoming requests and responses in real-time.

## Prerequisites

- Node.js (v20+)
- npm

## Getting Started

### 1. Installation

From the root of the repo:

```bash
cd tools/gca-mock
npm install
```

### 2. Building the Client

To build the React frontend:

```bash
npm run build:client
```

### 3. Running the Server

Start the mock server:

```bash
npm start
```

This will:

- Generate a self-signed SSL certificate.
- Start the API server at `https://localhost:3000`.
- Serve the UI at the same address.

### 4. Configuring Mocks

1.  Open `https://localhost:3000` in your browser.
    - You will see a security warning because of the self-signed certificate.
      Proceed to `localhost`.
2.  Use the sidebar to select the API endpoint you want to mock (e.g.,
    `/v1internal:generateContent`).
3.  Fill out the form to define the response body. The form fields are generated
    from the TypeScript definitions.
4.  (Optional) Set a **Status Code** (default `200`) or **Delay** (in ms).
5.  Click **Save Mock**.

### 5. Connecting Gemini CLI

To use the mock server with the Gemini CLI, you need to set two environment
variables:

- `CODE_ASSIST_ENDPOINT`: The URL of your mock server
  (`https://localhost:3000`).
- `NODE_TLS_REJECT_UNAUTHORIZED`: Set to `0` to allow the CLI to trust the
  self-signed certificate.

**Example Command:**

```bash
# In the root of gemini-cli-g1-credits
export CODE_ASSIST_ENDPOINT=https://localhost:3000
export NODE_TLS_REJECT_UNAUTHORIZED=0

node bundle/gemini.js prompt "Hello Mock Server"
```

## API Reference

The server exposes the following mockable endpoints (prefixed with
`/v1internal`):

- `POST :streamGenerateContent` (Streaming)
- `POST :generateContent`
- `POST :onboardUser`
- `POST :loadCodeAssist`
- `POST :fetchAdminControls`
- `POST :setCodeAssistGlobalUserSetting`
- `POST :countTokens`
- `POST :listExperiments`
- `POST :retrieveUserQuota`
- `POST :recordCodeAssistMetrics`
- `GET :getCodeAssistGlobalUserSetting`
- `GET /operations/:name`

You can also programmatically configure mocks via the `/api/mocks` endpoint:

```bash
curl -k -X POST https://localhost:3000/api/mocks \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/v1internal:generateContent",
    "method": "POST",
    "responses": [{
      "statusCode": 200,
      "body": { "response": { "candidates": [...] } }
    }]
  }'
```

### 6. File-Based Configuration

You can pre-load mocks from a JSON file using the `--mocks` flag or `MOCKS_FILE`
environment variable. This is useful for repeatable testing.

1.  Create a `mocks.json` file:

    ```json
    {
      "POST /v1internal:generateContent": {
        "endpoint": "/v1internal:generateContent",
        "method": "POST",
        "responses": [
          {
            "statusCode": 200,
            "body": { "response": { "candidates": [...] } }
          }
        ]
      }
    }
    ```

    _Tip: You can copy the JSON structure from the UI logs or the `/api/mocks`
    endpoint._

2.  Start the server with the file:

    ```bash
    npm start -- --mocks mocks.json
    ```

## Development

- **Regenerate Schemas**: If you modify `packages/core/src/code_assist/types.ts`
  or `converter.ts`, run this to update the UI schemas:
  ```bash
  npm run generate:schemas
  ```
- **Client Dev Server**: To run the frontend with hot-reload (requires the API
  server to be running separately):
  ```bash
  npm run dev:client
  ```

## Troubleshooting

- **Certificate Errors**: Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- **CORS Issues**: The server is configured to allow CORS, but browser security
  settings with self-signed certs can sometimes be tricky. Ensure you have
  accepted the cert by visiting the UI first.
