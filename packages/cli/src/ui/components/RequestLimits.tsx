/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Text } from 'ink';
import type { RequestLimitDetail } from '../types.js';
import { Section, StatRow } from './Stat.js';

interface RequestLimitsProps {
  limits: RequestLimitDetail[];
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function RequestLimits({ limits }: RequestLimitsProps) {
  return (
    <Section title="Request limits (all sessions)">
      {limits.map((limit) => {
        const percentage = Math.round(limit.remainingFraction * 100);
        const remainingStr = `${percentage}% remaining`;

        const title = `${limit.model}:`;
        let value: React.ReactNode;

        if (percentage === 100) {
          value = <Text>{remainingStr}</Text>;
        } else {
          const now = new Date();
          const resetsAt = limit.resetsAt;
          const tomorrow = new Date();
          tomorrow.setDate(now.getDate() + 1);

          const timeStr = resetsAt.toLocaleTimeString([], {
            timeStyle: 'short',
          });

          let resetQualifier: string;
          if (isSameDay(resetsAt, tomorrow)) {
            resetQualifier = `tomorrow at ${timeStr}`;
          } else if (!isSameDay(resetsAt, now)) {
            resetQualifier = `on ${resetsAt.toLocaleDateString()} at ${timeStr}`;
          } else {
            resetQualifier = `at ${timeStr}`;
          }
          value = (
            <Text>
              {remainingStr} (resets {resetQualifier})
            </Text>
          );
        }

        return (
          <StatRow key={limit.model} title={title}>
            {value}
          </StatRow>
        );
      })}
    </Section>
  );
}
