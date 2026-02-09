import React, { useState, useEffect, useRef } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemButton, Box, TextField, Button, Chip } from '@mui/material';

// Import schemas dynamically or statically?
// Statically for now to be safe, or fetch them?
// Let's import them all.
import LoadCodeAssistResponseSchema from './schemas/LoadCodeAssistResponse.json';
import GenerateContentResponseSchema from './schemas/GenerateContentResponse.json';
import CountTokensResponseSchema from './schemas/CountTokensResponse.json';
import ListExperimentsResponseSchema from './schemas/ListExperimentsResponse.json';

const SCHEMAS: Record<string, any> = {
    '/v1internal/loadCodeAssist': LoadCodeAssistResponseSchema,
    '/v1internal:generateContent': GenerateContentResponseSchema,
    '/v1internal:streamGenerateContent': GenerateContentResponseSchema, // Stream also uses GenerateContentResponse as chunks
    '/v1internal:countTokens': CountTokensResponseSchema,
    '/v1internal:listExperiments': ListExperimentsResponseSchema,
};

const ENDPOINTS = Object.keys(SCHEMAS);

interface LogEntry {
    timestamp: string;
    method: string;
    path: string;
    body: any;
    response: any;
}

function App() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ENDPOINTS[0]);
    const [mockResponse, setMockResponse] = useState<any>({});
    const [statusCode, setStatusCode] = useState(200);
    const [delay, setDelay] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket('wss://localhost:3000'); // Self-signed cert might block this without trust
        // Actually, since we are serving this APP from likely http://localhost:5173, wss://localhost:3000 should work if cert is accepted.
        // But better if we serve client from same server.
        // For dev, we might need to accept the cert manually.
        
        ws.onopen = () => console.log('Connected to WS');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'log') {
                setLogs(prev => [data.data, ...prev].slice(0, 50));
            }
        };
        wsRef.current = ws;

        return () => ws.close();
    }, []);

    const handleSubmit = async () => {
        // Send mock configuration to server
        const method = 'POST'; // Simplified for now, most GCA are POST
        const endpoint = selectedEndpoint; // e.g. /v1internal:generateContent

        const payload = {
            endpoint,
            method,
            responses: [
                {
                    statusCode,
                    body: mockResponse,
                    delay
                }
            ]
        };

        try {
            await fetch('https://localhost:3000/api/mocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert('Mock saved!');
        } catch (e) {
            console.error(e);
            alert('Failed to save mock (check console/network)');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                {/* Sidebar */}
                <Grid item xs={3}>
                    <Paper sx={{ height: '80vh', overflow: 'auto' }}>
                        <List>
                            {ENDPOINTS.map(ep => (
                                <ListItemButton 
                                    key={ep} 
                                    selected={selectedEndpoint === ep}
                                    onClick={() => setSelectedEndpoint(ep)}
                                >
                                    <ListItemText primary={ep.replace('/v1internal', '')} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Main Content */}
                <Grid item xs={6}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Configure Mock: {selectedEndpoint}</Typography>
                        <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
                            <TextField 
                                label="Status Code" 
                                type="number" 
                                value={statusCode} 
                                onChange={e => setStatusCode(Number(e.target.value))} 
                                size="small"
                            />
                            <TextField 
                                label="Delay (ms)" 
                                type="number" 
                                value={delay} 
                                onChange={e => setDelay(Number(e.target.value))} 
                                size="small"
                            />
                            <Button variant="contained" onClick={handleSubmit}>Save Mock</Button>
                        </Box>
                        
                        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                            <Form
                                schema={SCHEMAS[selectedEndpoint]}
                                validator={validator}
                                formData={mockResponse}
                                onChange={e => setMockResponse(e.formData)}
                            >
                                <></>
                            </Form>
                        </div>
                    </Paper>
                </Grid>

                {/* Logs */}
                <Grid item xs={3}>
                    <Paper sx={{ height: '80vh', overflow: 'auto', p: 1 }}>
                        <Typography variant="h6">Request Logs</Typography>
                        <List dense>
                            {logs.map((log, i) => (
                                <ListItem key={i} divider>
                                    <ListItemText
                                        primary={
                                            <Box>
                                                <Chip label={log.method} size="small" color="primary" sx={{ mr: 1 }} />
                                                {log.path}
                                            </Box>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {log.timestamp}
                                                </Typography>
                                                <br />
                                                {log.response ? `Status: ${log.response.status}` : 'Pending...'}
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default App;
