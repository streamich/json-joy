import * as React from 'react';
import {rule, theme, makeRule} from 'nano-theme';
import {Space} from '../../3-list-item/Space';
import LinkBack from '../../2-inline-block/LinkBack';

const blockClass = rule({
  pad: '0 0 16px',
  mar: '0 0 16px',
  d: 'flex',
  justifyContent: 'space-between',
});

const blockClass3 = rule({
  pad: '0 0 8px',
  mar: '0 0 8px',
});

const blockClass5 = rule({
  pad: '0 0 12px',
  mar: 0,
});

const blockClass6 = rule({
  pad: '0 0 12px',
  mar: 0,
});

const useBlockClass = makeRule((theme) => ({
  bdb: `1px solid ${theme.g(0.9)}`,
}));

const headerClass = rule({
  ...theme.font.ui2.bold,
  fz: '28px',
  mar: 0,
  pad: 0,
});

const headerClassH2 = rule({
  fz: '24px',
});

const headerClassH3 = rule({
  fz: '20px',
});

const headerClassH4 = rule({
  fz: '18px',
});

const headerClassH5 = rule({
  fz: '16px',
});

const headerClassH6 = rule({
  fz: '15px',
});

export interface Props {
  right?: React.ReactNode;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  h5?: boolean;
  h6?: boolean;
  back?: React.ReactNode;
  backTo?: string;
  children?: React.ReactNode;
}

const PageTitle: React.FC<Props> = ({h2, h3, h4, h5, h6, right, back, backTo, children}) => {
  const dynamicBlockClass = useBlockClass();

  const Component = h6 ? 'h6' : h5 ? 'h5' : h4 ? 'h4' : h3 ? 'h3' : h2 ? 'h2' : 'h1';

  return (
    <>
      {!!back && !!backTo && (
        <>
          <LinkBack to={backTo}>{back}</LinkBack>
          <Space />
        </>
      )}
      <div
        className={
          blockClass + dynamicBlockClass + (h6 ? blockClass6 : h5 ? blockClass5 : h2 || h3 || h4 ? blockClass3 : '')
        }
        style={{borderBottom: h6 || h5 || h4 || h3 || h2 ? 0 : undefined}}
      >
        <Component
          className={
            headerClass +
            (h6
              ? headerClassH6
              : h5
                ? headerClassH5
                : h4
                  ? headerClassH4
                  : h3
                    ? headerClassH3
                    : h2
                      ? headerClassH2
                      : '')
          }
        >
          {children}
        </Component>
        {right}
      </div>
    </>
  );
};

export default PageTitle;
