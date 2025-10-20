/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExperimentError {
  code?: number;
  message?: string;
}

export interface ListExperimentsResponseParameters {
  experimentIds?: number[] | null;
  flags?: FlagParameters[] | null;
  filteredFlags?: FilteredFlag[] | null;
}

export interface FlagParameters {
  name?: string | null;
  boolValue?: boolean | null;
  floatValue?: number | null;
  intValue?: number | null;
  stringValue?: string | null;
  int32ListValue?: Int32List | null;
  stringListValue?: StringList | null;
}

interface Int32List {
  values?: number[] | null;
}

interface StringList {
  values?: string[] | null;
}

export interface FilteredFlag {
  name?: string | null;
  reason: string;
}

interface BaseExperimentOverrides {
  model?: string;
}

export type ExperimentOverrides = BaseExperimentOverrides;

export interface ClientMetadataParameters {
  ideType?: ClientMetadataIdeType | null;
  ideVersion?: string | null;
  pluginVersion?: string | null;
  platform?: ClientMetadataPlatform | null;
  updateChannel?: string | null;
  duetProject?: string | null;
  pluginType?: ClientMetadataPluginType | null;
  ideName?: string | null;
}
export type ClientMetadataIdeType =
  | 'IDE_UNSPECIFIED'
  | 'VSCODE'
  | 'INTELLIJ'
  | 'VSCODE_CLOUD_WORKSTATION'
  | 'INTELLIJ_CLOUD_WORKSTATION'
  | 'CLOUD_SHELL';
export type ClientMetadataPlatform =
  | 'PLATFORM_UNSPECIFIED'
  | 'DARWIN_AMD64'
  | 'DARWIN_ARM64'
  | 'LINUX_AMD64'
  | 'LINUX_ARM64'
  | 'WINDOWS_AMD64';
export type ClientMetadataPluginType =
  | 'PLUGIN_UNSPECIFIED'
  | 'CLOUD_CODE'
  | 'GEMINI'
  | 'AIPLUGIN_INTELLIJ'
  | 'AIPLUGIN_STUDIO';

export interface ListExperimentsRequestParameters {
  project?: string | null;
  metadata?: ClientMetadataParameters | null;
}
