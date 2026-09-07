import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {useStyles} from '../../styles/context';
import {Avatar} from '../../1-inline/Avatar';
import {Card} from './Card';
import {CardHeader} from './CardHeader';
import {CardTitle} from './CardTitle';
import {Eyebrow} from '../../1-inline/Eyebrow';
import {TypeBadge} from '../../1-inline/TypeBadge';
import {StatusPill} from '../../1-inline/StatusPill';
import {BasicButton} from '../../2-inline-block/BasicButton';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {Iconista} from '../../icons/Iconista';

const meta: Meta<typeof CardHeader> = {
  title: '4. Card/Card/CardHeader',
  component: CardHeader,
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj<typeof meta>;

type IconProps = {size?: number};
const CircleDot: React.FC<IconProps> = ({size = 20}) => (
  <Iconista set="tabler" icon="circle-dot" color="currentColor" width={size} height={size} />
);
const FileText: React.FC<IconProps> = ({size = 20}) => (
  <Iconista set="tabler" icon="file-text" color="currentColor" width={size} height={size} />
);
const Plus: React.FC<IconProps> = ({size = 16}) => (
  <Iconista set="tabler" icon="plus" color="currentColor" width={size} height={size} />
);
const Grip: React.FC<IconProps> = ({size = 16}) => (
  <Iconista set="tabler" icon="grip-vertical" color="currentColor" width={size} height={size} />
);

const Checkbox: React.FC<{on?: boolean}> = ({on}) => {
  const styles = useStyles();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 5,
        background: on ? styles.accent + '' : 'transparent',
        border: `1.5px solid ${on ? styles.accent + '' : styles.g(0, 0.25)}`,
        color: '#fff',
      }}
    >
      {on && <Iconista set="tabler" icon="check" color="currentColor" width={12} height={12} />}
    </span>
  );
};
const DragHandle: React.FC = () => {
  const styles = useStyles();
  return (
    <span style={{display: 'inline-flex', color: styles.g(0.55), cursor: 'grab'}}>
      <Grip />
    </span>
  );
};

const ActionButton: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return (
    <BasicButton
      type="button"
      width="auto"
      height={28}
      compact
      rounder
      style={{
        fontWeight: 600,
        fontSize: 12.5,
        color: styles.light ? '#fff' : styles.g(0.04),
        background: styles.accent + '',
      }}
    >
      {children}
    </BasicButton>
  );
};

const Caption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useStyles();
  return (
    <div style={{marginBottom: 8, color: styles.g(0.5)}}>
      <Eyebrow>{children}</Eyebrow>
    </div>
  );
};

const Demo: React.FC<{label: string; width?: number; header: React.ReactNode}> = ({label, width = 380, header}) => (
  <div style={{width}}>
    <Caption>{label}</Caption>
    <Card header={header} />
  </div>
);

const Stack: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, maxWidth: 820}}>{children}</div>
);

const taskIcon = <TypeBadge icon={<CircleDot />} />;
const docIcon = <TypeBadge icon={<FileText />} />;

export const Permutations: Story = {
  render: () => (
    <Stack>
      <Demo
        label="identifier + title"
        header={
          <CardHeader
            title={<CardTitle title="Tune the hover transition" size="sm" clamp={1} />}
            identifier="JWIregr388Y"
            identifierCopyable
          />
        }
      />
      <Demo
        label="identifier + eyebrow + title"
        header={
          <CardHeader
            eyebrow={<Eyebrow>Task, Ticket</Eyebrow>}
            title={<CardTitle title="Tune the hover transition" size="sm" clamp={1} />}
            identifier="JWIregr388Y-tB8HU5W3K0A-zaydmulani09"
            identifierCopyable
          />
        }
      />
      <Demo
        label="eyebrow + identifier"
        header={<CardHeader eyebrow={<Eyebrow>Task</Eyebrow>} identifier="JWIregr388Y" identifierCopyable />}
      />
      <Demo
        label="icon + eyebrow + identifier"
        header={
          <CardHeader icon={taskIcon} eyebrow={<Eyebrow>Task</Eyebrow>} identifier="ENG-241" identifierCopyable />
        }
      />
      <Demo
        label="+ status"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            identifierCopyable
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
          />
        }
      />
      <Demo
        label="+ overflow menu"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            identifierCopyable
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
            menu={<BasicButtonMore rounder />}
          />
        }
      />
      <Demo
        label="+ primary action"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            identifierCopyable
            actions={<ActionButton>Assign</ActionButton>}
            menu={<BasicButtonMore rounder />}
          />
        }
      />
      <Demo
        label="end meta (count / time)"
        header={
          <CardHeader
            icon={docIcon}
            eyebrow={<Eyebrow>Doc</Eyebrow>}
            identifier="DOC-12"
            identifierCopyable
            meta="8 min"
          />
        }
      />
      <Demo
        label="+ all"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            identifierCopyable
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
            actions={<ActionButton>Assign</ActionButton>}
            menu={<BasicButtonMore rounder />}
            meta="8 min"
          />
        }
      />
    </Stack>
  ),
};

export const StartGroup: Story = {
  render: () => (
    <Stack>
      <Demo
        label="selectable (checkbox)"
        header={
          <CardHeader
            selectable={<Checkbox on />}
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
          />
        }
      />
      <Demo
        label="drag handle"
        header={
          <CardHeader
            dragHandle={<DragHandle />}
            icon={taskIcon}
            title={<CardTitle title="Tune the hover transition" size="sm" clamp={1} />}
          />
        }
      />
      <Demo
        label="title folded into header (row style)"
        header={
          <CardHeader
            icon={<TypeBadge icon={<CircleDot size={14} />} size={24} />}
            identifier="ENG-241"
            title={<CardTitle title="Tune the card hover transition" size="sm" clamp={1} />}
            status={<StatusPill tone="warning" shape="ring" small label="Active" />}
          />
        }
      />
      <Demo
        label="avatar lead (person)"
        header={
          <CardHeader
            icon={<Avatar name="Jules Maron" width={36} />}
            title={<CardTitle title="Jules Maron" subtitle="@jules" size="sm" />}
          />
        }
      />
    </Stack>
  ),
};

export const EndGroup: Story = {
  render: () => (
    <Stack>
      <Demo
        label="status — dot / ring / check / dash"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            status={<StatusPill tone="success" shape="check" label="Done" />}
          />
        }
      />
      <Demo
        label="status (accent dot)"
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Event</Eyebrow>}
            status={<StatusPill tone="accent" label="Upcoming" />}
          />
        }
      />
      <Demo
        label="meta + menu"
        header={
          <CardHeader
            icon={docIcon}
            eyebrow={<Eyebrow>Doc</Eyebrow>}
            identifier="DOC-12"
            meta="2h ago"
            menu={<BasicButtonMore />}
          />
        }
      />
      <Demo
        label="status + meta + actions + menu (full)"
        width={460}
        header={
          <CardHeader
            icon={taskIcon}
            eyebrow={<Eyebrow>Task</Eyebrow>}
            identifier="ENG-241"
            status={<StatusPill tone="warning" shape="ring" label="In Progress" />}
            meta="2h"
            actions={
              <ActionButton>
                <Plus /> Add
              </ActionButton>
            }
            menu={<BasicButtonMore />}
          />
        }
      />
    </Stack>
  ),
};

const DensityRow: React.FC<{density: 'comfortable' | 'compact' | 'dense'; iconSize: number}> = ({
  density,
  iconSize,
}) => (
  <div style={{width: 380}}>
    <Caption>{density}</Caption>
    <Card
      density={density}
      header={
        <CardHeader
          icon={<TypeBadge icon={<CircleDot size={Math.round(iconSize * 0.56)} />} size={iconSize} />}
          eyebrow={<Eyebrow>Task</Eyebrow>}
          identifier="ENG-241"
          status={<StatusPill tone="warning" shape="ring" small label="In Progress" />}
          menu={<BasicButtonMore />}
        />
      }
    />
  </div>
);

export const Density: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      <DensityRow density="comfortable" iconSize={36} />
      <DensityRow density="compact" iconSize={30} />
      <DensityRow density="dense" iconSize={24} />
    </div>
  ),
};
