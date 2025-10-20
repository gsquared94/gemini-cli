/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as os from 'node:os';
import * as process from 'node:process';
import type {
  ClientMetadataParameters,
  ClientMetadataIdeType,
  ClientMetadataPlatform,
  ClientMetadataPluginType,
} from './interfaces.js';

export class ClientMetadataFactory {
  get platform(): ClientMetadataPlatform {
    if (process.platform === 'win32') {
      return 'WINDOWS_AMD64';
    }
    if (process.platform === 'darwin') {
      return os.arch() === 'arm64' ? 'DARWIN_ARM64' : 'DARWIN_AMD64';
    }
    return 'LINUX_AMD64';
  }

  get ideType(): ClientMetadataIdeType {
    return 'VSCODE';
  }

  get pluginVersion() {
    return process.env['CLI_VERSION'] || 'unknown';
  }

  get ideVersion() {
    return 'unknown';
  }

  get pluginType(): ClientMetadataPluginType {
    return 'GEMINI';
  }

  get ideName() {
    return 'gemini-cli';
  }

  buildClientMetadata(projectId: string): ClientMetadataParameters {
    return {
      ideType: this.ideType,
      ideVersion: this.ideVersion,
      platform: this.platform,
      pluginVersion: this.pluginVersion,
      updateChannel: '',
      duetProject: projectId,
      pluginType: this.pluginType,
      ideName: this.ideName,
    };
  }
}
