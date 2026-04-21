import * as React from 'react';

const serif = '"Merriweather","Linux Libertine",serif';
const slab = '"Roboto Slab",serif';

export interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const MuTxtLogo: React.FC<Props> = ({size = 36, ...props}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="mutxt"
      {...props}
    >
      <g fill="currentColor">
        <text x={4.5} y={30.6} fontFamily={serif} fontSize={15.3} fontWeight={400}>
          {'μ'}
        </text>
        <text x={11.6} y={25.4} fontFamily={slab} fontSize={22.5} fontWeight={700}>
          {'t'}
        </text>
        <text x={19} y={30.5} fontFamily={slab} fontSize={22.5} fontWeight={700}>
          {'x'}
        </text>
        <text x={33.4} y={35.35} fontFamily={slab} fontSize={22.5} fontWeight={700}>
          {'t'}
        </text>
      </g>
    </svg>
  );
};

export default MuTxtLogo;