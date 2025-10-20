/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExperimentOverrides } from './interfaces.js';

export interface ExperimentProvider {
  getExperimentFlags(): Promise<ExperimentOverrides>;
}
