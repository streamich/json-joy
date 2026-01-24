import * as React from 'react';

const qrcode = require('qrcode-generator'); // eslint-disable-line

type TypeNumber =
  | 0 // Automatic type number
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

export interface QrCodeProps extends React.HTMLAttributes<HTMLSpanElement> {
  data: string;
  type?: TypeNumber;
  level?: 'L' | 'M' | 'Q' | 'H';
}

const QrCode: React.FC<QrCodeProps> = ({data, type = 0, level = 'L', ...rest}) => {
  const [__html, setHtml] = React.useState<string | ''>('');
  React.useEffect(() => {
    const qr = qrcode(type, level);
    qr.addData(data);
    qr.make();
    setHtml(qr.createSvgTag({scalable: true}));
  }, [data, type, level]);

  return <span {...rest} dangerouslySetInnerHTML={{__html}} />;
};

export default QrCode;
