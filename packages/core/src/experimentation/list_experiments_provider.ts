/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExperimentProvider } from './experiment_provider.js';
import type {
  ExperimentOverrides,
  ListExperimentsRequestParameters,
  ListExperimentsResponseParameters,
} from './interfaces.js';
import type { Config } from '../config/config.js';
import { LoggingContentGenerator } from '../core/loggingContentGenerator.js';
import { CodeAssistServer } from '../code_assist/server.js';
import { request } from 'undici';
import { ClientMetadataFactory } from './client_metadata.js';

const CODE_ASSIST_ENDPOINT = 'https://cloudcode-pa.googleapis.com';
const LIST_EXPERIMENTS_METHOD = 'v1internal:listExperiments';

export class ListExperimentsProvider implements ExperimentProvider {
  constructor(private readonly config: Config) {}

  async getExperimentFlags(): Promise<ExperimentOverrides> {
    const contentGenerator = this.config.getContentGenerator();
    let server = contentGenerator;
    if (server instanceof LoggingContentGenerator) {
      server = server.getWrapped();
    }

    if (!(server instanceof CodeAssistServer)) {
      return Promise.resolve({});
    }

    const client = server.client;
    const { token } = await client.getAccessToken();

    if (!token) {
      return Promise.resolve({});
    }

    const metadataFactory = new ClientMetadataFactory();
    const metadata = metadataFactory.buildClientMetadata(
      server.projectId || '',
    );

    const requestBody: ListExperimentsRequestParameters = {
      metadata,
    };

    const endpoint = `${CODE_ASSIST_ENDPOINT}/${LIST_EXPERIMENTS_METHOD}`;

    try {
      const response = await request(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.statusCode !== 200) {
        console.error(
          `ListExperiments request failed with status code: ${response.statusCode}`,
        );
        return Promise.resolve({});
      }

      const responseBody = await response.body.json();
      const flags =
        (responseBody as ListExperimentsResponseParameters).flags || [];
      const overrides: ExperimentOverrides = {};
      for (const flag of flags) {
        if (flag.name === 'model' && flag.stringValue) {
          overrides.model = flag.stringValue;
        }
      }
      return overrides;
    } catch (error) {
      console.error('ListExperiments request failed:', error);
      return Promise.resolve({});
    }
  }
}
