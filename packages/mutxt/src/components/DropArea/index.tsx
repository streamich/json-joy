import * as React from 'react';
import {DropArea as UiDropArea} from '@jsonjoy.com/ui/lib/5-block/DropArea';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useT} from 'use-t';
import {useExplorer} from '../../context';

export interface DropAreaProps {
  compact?: boolean;
}

export const DropArea: React.FC<DropAreaProps> = ({compact}) => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);
  const [t] = useT();

  const onFiles = React.useCallback(
    (dropped: File[]) => state.addFiles(dropped),
    [state],
  );
  const onUri = React.useCallback((uri: string) => console.log('uri', uri), []);
  const onText = React.useCallback((text: string) => console.log('text', text), []);

  return (
    <UiDropArea
      compact={compact || files.length > 0}
      onFiles={onFiles}
      onUri={onUri}
      onText={onText}
    >
      <Text className="DropArea-text" font={'ui3'} size={-1} style={{pointerEvents: 'none'}}>
        {t('Click or drop files here')}
      </Text>
    </UiDropArea>
  );
};
