import * as React from 'react';
import {rule} from 'nano-theme';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {InputLine} from '@jsonjoy.com/ui/lib/2-inline-block/InputLine';
import {CopyInput} from '@jsonjoy.com/ui/lib/2-inline-block/CopyInput';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {LiveCrdt, type LiveCrdtProps} from '.';

export interface LiveCrdtRoomProps extends Omit<LiveCrdtProps, 'id'> {
  /** Optional initial room ID. When omitted the entry screen is shown. */
  initialId?: string;
  /** Optional title shown in the room header. */
  title?: React.ReactNode;
  /** Override the random ID generator. */
  generateId?: () => string;
}

const defaultGenerateId = (): string => Math.random().toString(36).slice(2, 10);

const cardClass = rule({
  pd: '16px',
  bxz: 'border-box',
});

const headerClass = rule({
  pd: '12px 16px',
  bxz: 'border-box',
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '16px',
  fxw: 'wrap',
});

const headerLeftClass = rule({
  d: 'flex',
  fxd: 'column',
  gap: '2px',
  minW: 0,
});

const headerRightClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  miw: '260px',
});

const entryRowClass = rule({
  d: 'flex',
  gap: '8px',
  ai: 'stretch',
  mr: '16px 0 8px',
  fxw: 'wrap',
});

const entryInputClass = rule({
  fxg: 1,
  miw: '220px',
});

/**
 * Wraps {@link LiveCrdt} with a room-entry flow: the user is shown a small
 * form to join an existing room (by entering a document ID) or to spin up a
 * fresh one (random ID). Once an ID is settled, the live document is rendered
 * with a header showing the join-ID so it can be shared with other users.
 */
export const LiveCrdtRoom: React.FC<LiveCrdtRoomProps> = ({
  initialId,
  title,
  generateId = defaultGenerateId,
  ...liveCrdtProps
}) => {
  const [id, setId] = React.useState<string | undefined>(initialId);

  if (!id) return <RoomEntry onJoin={setId} generateId={generateId} title={title} />;

  return (
    <div>
      <RoomHeader id={id} title={title} onLeave={() => setId(undefined)} />
      <LiveCrdt {...liveCrdtProps} id={id} />
    </div>
  );
};

interface RoomEntryProps {
  onJoin: (id: string) => void;
  generateId: () => string;
  title?: React.ReactNode;
}

const RoomEntry: React.FC<RoomEntryProps> = ({onJoin, generateId, title}) => {
  const [value, setValue] = React.useState('');
  const trimmed = value.trim();
  const join = () => {
    if (trimmed) onJoin(trimmed);
  };
  const create = () => onJoin(generateId());
  return (
    <Paper className={cardClass} fill={1} noOutline round>
      {!!title && (
        <Text as="h3" font="sans" kind="bold" style={{margin: '0 0 4px', fontSize: 22}}>
          {title}
        </Text>
      )}
      <Text as="p" font="sans" kind="mid" size={-1} style={{margin: '0 0 4px', opacity: 0.75}}>
        Enter a document ID to join an existing room, or create a new one.
      </Text>
      <div className={entryRowClass}>
        <div className={entryInputClass}>
          <InputLine value={value} label="Document ID" focus onChange={setValue} />
        </div>
        <Button primary disabled={!trimmed} onClick={join}>
          Join
        </Button>
        <Button ghost onClick={create}>
          Generate random
        </Button>
      </div>
    </Paper>
  );
};

interface RoomHeaderProps {
  id: string;
  title?: React.ReactNode;
  onLeave: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({id, title, onLeave}) => {
  return (
    <Paper className={headerClass} fill={1} noOutline round>
      <div className={headerLeftClass}>
        {!!title && (
          <Text as="h3" font="sans" kind="bold" style={{margin: 0, fontSize: 20, lineHeight: 1.3}}>
            {title}
          </Text>
        )}
        <Text as="span" font="sans" kind="mid" size={-1} style={{opacity: 0.75}}>
          Share this ID with others to collaborate in the same room.
        </Text>
      </div>
      <div className={headerRightClass}>
        <div style={{flexGrow: 1}}>
          <CopyInput value={id} label="Room ID" readOnly />
        </div>
        <Button ghost onClick={onLeave}>
          Leave
        </Button>
      </div>
    </Paper>
  );
};
