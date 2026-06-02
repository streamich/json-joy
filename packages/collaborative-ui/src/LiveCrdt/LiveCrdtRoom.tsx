import * as React from 'react';
import {rule} from 'nano-theme';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {CopyInput} from '@jsonjoy.com/ui/lib/2-inline-block/CopyInput';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {LiveCrdt, type LiveCrdtProps} from '.';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';

export interface LiveCrdtRoomProps extends Omit<LiveCrdtProps, 'id'> {
  /** Optional initial room ID. When omitted the entry screen is shown. */
  initialId?: string;
  /** Override the random ID generator. */
  generateId?: () => string;
}

const defaultGenerateId = (): string => Math.random().toString(36).slice(2, 10);

const headerClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '12px',
  fxw: 'wrap',
  mar: '0 0 12px',
});

const headerIdClass = rule({
  fxg: 1,
  miw: '220px',
});

/**
 * Wraps {@link LiveCrdt} with a room-entry flow: two clear paths to join an
 * existing room by ID or to spin up a new one with a random ID. Once an ID is
 * settled, the live document is rendered with a compact header showing the
 * room ID so it can be shared with other users.
 */
export const LiveCrdtRoom: React.FC<LiveCrdtRoomProps> = ({
  initialId,
  generateId = defaultGenerateId,
  ...liveCrdtProps
}) => {
  const [id, setId] = React.useState<string | undefined>(initialId);

  if (!id) return <RoomEntry onJoin={setId} generateId={generateId} />;

  return (
    <div>
      <RoomHeader id={id} onLeave={() => setId(undefined)} />
      <LiveCrdt {...liveCrdtProps} id={id} />
    </div>
  );
};

interface RoomEntryProps {
  onJoin: (id: string) => void;
  generateId: () => string;
}

const RoomEntry: React.FC<RoomEntryProps> = ({onJoin, generateId}) => {
  const [value, setValue] = React.useState('');
  const trimmed = value.trim();
  const join = () => {
    if (trimmed) onJoin(trimmed);
  };
  const create = () => onJoin(generateId());
  return (
    <div style={{maxWidth: 400, margin: '0 auto', padding: '16px 0'}}>
      <div style={{padding: '16px 0'}}>
        <Split>
          <div style={{paddingBottom: 8}}>
            <MiniTitle>Start a new room</MiniTitle>
          </div>
          <Button ghost onClick={create}>
            Generate random ID
          </Button>
        </Split>
      </div>
      <Separator />
      <div style={{padding: '16px 0'}}>
        <Split>
          <div style={{paddingBottom: 8}}>
            <MiniTitle>Join an existing room</MiniTitle>
          </div>
          <div style={{display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'end'}}>
            <Input value={value} label="Document ID" onChange={setValue} onEnter={join} />
            <Button primary disabled={!trimmed} onClick={join}>
              Join
            </Button>
          </div>
        </Split>
      </div>
    </div>
  );
};

interface RoomHeaderProps {
  id: string;
  onLeave: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({id, onLeave}) => {
  return (
    <div className={headerClass}>
      <div className={headerIdClass}>
        <CopyInput value={id} label="Room ID" readOnly />
      </div>
      <Button ghost onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
};
