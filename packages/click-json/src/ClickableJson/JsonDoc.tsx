import {escapeComponent} from '@jsonjoy.com/json-pointer';
import * as React from 'react';
import {useFocus} from '../context/focus';
import {useStyles} from '../context/style';
import * as css from '../css';
import {ObjectLayout} from '../ObjectLayout';
import {context, useExpandAll} from './context';
import {JsonArrayInsert} from './JsonArrayInsert';
import {JsonHoverable} from './JsonHoverable';
import {JsonObjectInsert} from './JsonObjectInsert';
import {JsonProperty} from './JsonProperty';
import {JsonValue} from './JsonValue';
import type {OnChange} from './types';

interface JsonObjectProps {
  property?: string | number;
  doc: object;
  pointer: string;
  parentCollapsed?: boolean;
  comma?: boolean;
  onChange?: OnChange;
}

const JsonObject: React.FC<JsonObjectProps> = ({property, doc, pointer, parentCollapsed, comma, onChange}) => {
  const {pfx} = React.useContext(context);
  const {focused} = useFocus();
  const {formal, keepOrder, collapsed: startsCollapsed} = useStyles();
  const keys = React.useMemo(() => {
    const k = Object.keys(doc);
    return keepOrder ? k : k.sort();
  }, [doc, keepOrder]);
  const [collapsed, setCollapsed] = React.useState(startsCollapsed);
  useExpandAll(pointer, (open) => setCollapsed(!open));

  const handleBracketClick = () => {
    if (!collapsed && pfx + pointer === focused) setCollapsed(true);
  };

  const entries = keys.map((key, index) => {
    const itemPointer = `${pointer}/${escapeComponent(key)}`;
    return (
      <span key={key} className={css.line}>
        <JsonHoverable pointer={itemPointer} value={(doc as Record<string, unknown>)[key]} property={key}>
          <span className={css.lineInner}>
            <JsonDoc
              property={key}
              doc={(doc as Record<string, unknown>)[key]}
              pointer={itemPointer}
              parentCollapsed={collapsed}
              comma={formal && index < keys.length - 1}
              onChange={onChange}
            />
          </span>
        </JsonHoverable>
      </span>
    );
  });

  return (
    <ObjectLayout
      collapsed={collapsed}
      collapsedView={!!keys.length && <strong>{keys.length}</strong>}
      comma={comma}
      property={
        typeof property === 'string' && (
          <JsonProperty key={'k' + String(parentCollapsed)} pointer={pointer} onChange={onChange} />
        )
      }
      onClick={() => {
        if (collapsed) setCollapsed(false);
      }}
      onCollapserClick={() => setCollapsed((x) => !x)}
      onBracketClick={handleBracketClick}
    >
      {entries}
      <JsonObjectInsert pointer={pointer} visible={focused === pfx + pointer} />
    </ObjectLayout>
  );
};

interface JsonArrayProps {
  property?: string | number;
  doc: unknown[];
  pointer: string;
  parentCollapsed?: boolean;
  comma?: boolean;
  onChange?: OnChange;
}

const JsonArray: React.FC<JsonArrayProps> = ({property, doc, pointer, parentCollapsed, comma, onChange}) => {
  const {pfx} = React.useContext(context);
  const {focused} = useFocus();
  const {formal: selectable, collapsed: startsCollapsed} = useStyles();
  const [collapsed, setCollapsed] = React.useState(startsCollapsed);
  useExpandAll(pointer, (open) => setCollapsed(!open));

  const handleBracketClick = () => {
    if (!collapsed && pfx + pointer === focused) setCollapsed(true);
  };

  const entries = doc.map((value, index) => {
    const itemPointer = `${pointer}/${index}`;
    return (
      <React.Fragment key={index}>
        <JsonArrayInsert pointer={`${pointer}/${index}`} visible={focused === pfx + pointer} />
        <span className={css.line}>
          <JsonHoverable pointer={itemPointer} value={doc[index]} property={index}>
            <span className={css.lineInner}>
              <JsonDoc
                doc={doc[index]}
                pointer={itemPointer}
                parentCollapsed={collapsed}
                comma={selectable && index < doc.length - 1}
                onChange={onChange}
              />
            </span>
          </JsonHoverable>
        </span>
      </React.Fragment>
    );
  });

  return (
    <ObjectLayout
      collapsed={collapsed}
      collapsedView={!!doc.length && <strong>{doc.length}</strong>}
      comma={comma}
      property={
        typeof property === 'string' && (
          <JsonProperty key={'k' + String(parentCollapsed)} pointer={pointer} onChange={onChange} />
        )
      }
      onClick={() => {
        if (collapsed) setCollapsed(false);
      }}
      onCollapserClick={() => setCollapsed((x) => !x)}
      onBracketClick={handleBracketClick}
      brackets={['[', ']']}
    >
      {entries}
      <JsonArrayInsert pointer={`${pointer}/-`} visible={focused === pfx + pointer} />
    </ObjectLayout>
  );
};

export interface JsonDocProps {
  property?: string | number;
  doc: unknown;
  pointer: string;
  parentCollapsed?: boolean;
  comma?: boolean;
  onChange?: OnChange;
}

export const JsonDoc: React.FC<JsonDocProps> = (props) => {
  const {doc, comma} = props;
  return !doc ? (
    <JsonValue {...props} />
  ) : typeof doc === 'object' ? (
    Array.isArray(doc) ? (
      <JsonArray {...props} doc={doc} />
    ) : doc instanceof Uint8Array ? (
      <JsonValue {...props} comma={comma} />
    ) : (
      <JsonObject {...props} doc={doc} />
    )
  ) : (
    <JsonValue {...props} />
  );
};
