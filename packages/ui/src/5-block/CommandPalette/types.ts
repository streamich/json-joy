import * as React from 'react';

export interface CommandPaletteCmdItem {
  id: string;
  name: string;
  icon?: {
    set: string;
    icon: string;
    size?: number;
  };
  actionLabel?: React.ReactNode;
  /** Search similarity score. */
  score?: number;
  hasArgs?: boolean;
}

export interface CommandPaletteCmdGroup {
  id: string;
  name: React.ReactNode;
  list: CommandPaletteCmdItem[];
}

export type CommandPaletteCmdRef = [groupId: string, cmdId: string];
