import * as React from 'react';
import {ObjectLayout, ObjectLayoutProps} from '../ObjectLayout';
import {useStyles} from '../context/style';
import {useFocus} from '../context/focus';
import type {NodeRef} from './NodeRef';
import type {JsonNode} from 'json-joy/lib/json-crdt';
import {id} from './utils';

export interface JsonCrdtObjectLayoutProps extends ObjectLayoutProps {
  node: NodeRef<JsonNode>;
}

export const JsonCrdtObjectLayout: React.FC<JsonCrdtObjectLayoutProps> = ({node, ...rest}) => {
  const {collapsed: startsCollapsed} = useStyles();
  const {focused} = useFocus();
  const [collapsed, setCollapsed] = React.useState(startsCollapsed);

  const handleBracketClick = () => {
    if (!collapsed && id(node) === focused) setCollapsed(true);
  };

  return (
    <ObjectLayout
      collapsed={collapsed}
      onCollapserClick={() => setCollapsed(!collapsed)}
      onBracketClick={handleBracketClick}
      onCollapsedClick={() => {
        if (collapsed) setCollapsed(false);
      }}
      {...rest}
    />
  );
};
