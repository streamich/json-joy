import {app, BrowserWindow, shell, protocol, net} from 'electron';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

app.setName('mu-txt');

const isDev = !app.isPackaged;
const distRoot = path.resolve(__dirname, '..', 'dist');
const iconsRoot = path.resolve(__dirname, '..', 'public', 'icons');

type PendingInput = {kind: 'path'; value: string} | {kind: 'url'; value: string};

const pending: PendingInput[] = [];
let mainWindow: BrowserWindow | null = null;
let rendererReady = false;

const channelFor = (kind: PendingInput['kind']) => (kind === 'path' ? 'mutxt:open-path' : 'mutxt:open-url');

const dispatch = (item: PendingInput) => {
  if (rendererReady && mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channelFor(item.kind), item.value);
  } else {
    pending.push(item);
  }
};

const flushPending = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  while (pending.length) {
    const item = pending.shift()!;
    mainWindow.webContents.send(channelFor(item.kind), item.value);
  }
};

const inputFromArgv = (argv: readonly string[]): PendingInput | null => {
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('-')) continue;
    if (arg.startsWith('mutxt://')) return {kind: 'url', value: arg};
    if (path.isAbsolute(arg)) return {kind: 'path', value: arg};
  }
  return null;
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true},
  },
]);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const input = inputFromArgv(argv);
    if (input) dispatch(input);
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    dispatch({kind: 'url', value: url});
  });
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    dispatch({kind: 'path', value: filePath});
  });

  if (!app.isDefaultProtocolClient('mutxt')) {
    app.setAsDefaultProtocolClient('mutxt');
  }

  const initial = inputFromArgv(process.argv);
  if (initial) dispatch(initial);

  app.whenReady().then(() => {
    if (!isDev) registerAppProtocol();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

function registerAppProtocol(): void {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (!pathname || pathname === '/') pathname = '/index.html';

    const candidate = path.normalize(path.join(distRoot, pathname));
    if (!candidate.startsWith(distRoot)) {
      return new Response('Forbidden', {status: 403});
    }

    const target = path.extname(candidate) ? candidate : path.join(distRoot, 'index.html');
    return net.fetch(pathToFileURL(target).toString());
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 21 },
    backgroundColor: '#0f172a',
    icon: path.join(iconsRoot, 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });

  mainWindow.webContents.on('did-finish-load', () => {
    rendererReady = true;
    flushPending();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    rendererReady = false;
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({mode: 'detach'});
  } else {
    mainWindow.loadURL('app://-/index.html');
  }
}
