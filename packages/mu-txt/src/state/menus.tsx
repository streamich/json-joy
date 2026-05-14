import * as React from 'react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {templates} from './templates';
import type {MuTxtAppState} from '.';
import FileMuTxtIcon__svg from 'iconista/lib/react/bootstrap/file-earmark-text';
import FileJsonIcon__svg from 'iconista/lib/react/bootstrap/filetype-json';

const FileMuTxtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FileMuTxtIcon__svg width={16} height={16} {...props} />
);
const FileJsonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FileJsonIcon__svg width={16} height={16} {...props} />
);

export class Menus {
  constructor(public readonly state: MuTxtAppState) {}

  public newFileMenu(): MenuItem {
    const {state} = this;
    return {
      name: 'New',
      minWidth: 300,
      expand: 8,
      children: [
        // {
        //   name: 'Rich-text',
        //   expand: 8,
        //   children: [
        //     {
        //       name: 'Empty document',
        //       icon: () => <FileMuTxtIcon />,
        //       onSelect: () => state.createNewMuTxt(),
        //     },
        //   ],
        // },
        {
          name: 'Work',
          expand: 8,
          // sepBefore: true,
          children: templates
            .filter((tpl) => tpl.category === 'work')
            .map((tpl) => ({
              id: tpl.id,
              name: tpl.name,
              text: tpl.name + ' - ' + tpl.description,
              icon: () => <FileMuTxtIcon />,
              right: () => <Sidetip small>{tpl.description}</Sidetip>,
              onSelect: () => state.createNewMuTxtFromSlate(tpl.doc, tpl.fileName),
            })),
        },
        {
          name: 'Everyday',
          expand: 8,
          sepBefore: true,
          children: templates
            .filter((tpl) => tpl.category === 'personal')
            .map((tpl) => ({
              id: tpl.id,
              name: tpl.name,
              text: tpl.name + ' - ' + tpl.description,
              icon: () => <FileMuTxtIcon />,
              right: () => <Sidetip small>{tpl.description}</Sidetip>,
              onSelect: () => state.createNewMuTxtFromSlate(tpl.doc, tpl.fileName),
            })),
        },
        {
          name: 'JSON',
          expand: 0,
          sepBefore: true,
          minWidth: 288,
          children: [
            {
              name: 'Empty document',
              right: () => (
                <Sidetip>
                  <Code>
                    <span style={{fontSize: '11.5px'}}>{'()'}</span>
                  </Code>
                </Sidetip>
              ),
              icon: () => <FileJsonIcon />,
              onSelect: () => state.createNew(),
            },
            {
              name: 'Empty object',
              right: () => (
                <Sidetip>
                  <Code>
                    <span style={{fontSize: '11.5px'}}>{'{}'}</span>
                  </Code>
                </Sidetip>
              ),
              icon: () => <FileJsonIcon />,
              onSelect: () => state.createNew({}),
            },
            {
              name: 'Empty array',
              right: () => (
                <Sidetip>
                  <Code>
                    <span style={{fontSize: '11.5px'}}>{'[]'}</span>
                  </Code>
                </Sidetip>
              ),
              icon: () => <FileJsonIcon />,
              onSelect: () => state.createNew([]),
            },
            {
              name: 'Sample document',
              right: () => (
                <Sidetip>
                  <Code>
                    <span style={{fontSize: '11.5px'}}>{'{"foo": ...'}</span>
                  </Code>
                </Sidetip>
              ),
              icon: () => <FileJsonIcon />,
              onSelect: () =>
                state.createNew({
                  name: 'Alice',
                  age: 30,
                  hobbies: ['reading', 'hiking'],
                  address: {
                    city: 'Wonderland',
                    zip: '12345',
                  },
                }),
            },
          ],
        },
      ],
    };
  }
}
