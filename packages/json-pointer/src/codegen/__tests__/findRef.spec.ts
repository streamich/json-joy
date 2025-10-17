import {$findRef} from '../findRef';
import type {Path} from '../..';
import {testFindRef} from '../../__tests__/testFindRef';

testFindRef((val: unknown, path: Path) => $findRef(path)(val));
