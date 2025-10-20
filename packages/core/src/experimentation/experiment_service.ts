/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExperimentOverrides } from './interfaces.js';
import { ListExperimentsProvider } from './list_experiments_provider.js';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Config } from '../config/config.js';

export class ExperimentationService {
  private overrides: ExperimentOverrides = {};

  constructor(private readonly config: Config) {}

  getExperimentOverrides(): ExperimentOverrides {
    return this.overrides;
  }

  async fetchExperiments() {
    const provider = new ListExperimentsProvider(this.config);
    this.overrides = await provider.getExperimentFlags();
    this.config.applyExperimentOverrides(this.overrides);
    console.log('Experiments fetched:', this.overrides);
  }

  clearExperiments() {
    this.overrides = {};
    this.config.applyExperimentOverrides(this.overrides);
    console.log('Experiments cleared');
  }
}
