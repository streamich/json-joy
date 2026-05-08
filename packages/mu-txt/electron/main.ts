import {app, BrowserWindow, dialog, ipcMain, shell, protocol, net, Menu, type MenuItemConstructorOptions} from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

app.setName('mu-txt');

const isDev = !app.isPackaged;
const distRoot = path.resolve(__dirname, '..', 'dist');
const iconsRoot = path.resolve(__dirname, '..', 'public', 'icons');

type PendingInput =
  | {kind: 'file'; name: string; path: string; bytes?: Uint8Array}
  | {kind: 'url'; value: string};

const pending: PendingInput[] = [];
let mainWindow: BrowserWindow | null = null;
let rendererReady = false;

const channelFor = (kind: PendingInput['kind']) => (kind === 'file' ? 'mutxt:open-file' : 'mutxt:open-url');

const payloadFor = (item: PendingInput) =>
  item.kind === 'file' ? {name: item.name, path: item.path, bytes: item.bytes} : item.value;

const send = (item: PendingInput) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channelFor(item.kind), payloadFor(item));
};

const dispatch = (item: PendingInput) => {
  if (rendererReady && mainWindow && !mainWindow.isDestroyed()) {
    send(item);
  } else {
    pending.push(item);
  }
};

const flushPending = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  while (pending.length) send(pending.shift()!);
};

const userArgv = (argv: readonly string[]): readonly string[] => argv.slice(process.defaultApp ? 2 : 1);

type ParsedArg = {kind: 'path'; value: string} | {kind: 'url'; value: string};

const parseArg = (argv: readonly string[], cwd: string): ParsedArg | null => {
  for (const arg of userArgv(argv)) {
    if (!arg || arg.startsWith('-')) continue;
    if (arg.startsWith('mutxt://')) return {kind: 'url', value: arg};
    return {kind: 'path', value: path.isAbsolute(arg) ? arg : path.resolve(cwd, arg)};
  }
  return null;
};

const dispatchPath = async (filePath: string) => {
  const name = path.basename(filePath);
  try {
    const buf = await fs.readFile(filePath);
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    dispatch({kind: 'file', name, path: filePath, bytes});
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      dispatch({kind: 'file', name, path: filePath});
    } else {
      console.error('[mutxt] failed to read file', filePath, err);
    }
  }
};

const dispatchArg = (argv: readonly string[], cwd: string) => {
  const parsed = parseArg(argv, cwd);
  if (!parsed) return;
  if (parsed.kind === 'url') dispatch({kind: 'url', value: parsed.value});
  else void dispatchPath(parsed.value);
};

const openDialog = async (): Promise<void> => {
  const opts: Electron.OpenDialogOptions = {
    title: 'Open File',
    properties: ['openFile', 'multiSelections'],
  };
  const result =
    mainWindow && !mainWindow.isDestroyed()
      ? await dialog.showOpenDialog(mainWindow, opts)
      : await dialog.showOpenDialog(opts);
  if (result.canceled) return;
  for (const filePath of result.filePaths) void dispatchPath(filePath);
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
  app.on('second-instance', (_event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    dispatchArg(argv, workingDirectory || process.cwd());
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    dispatch({kind: 'url', value: url});
  });
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    void dispatchPath(filePath);
  });

  ipcMain.handle('mutxt:open-dialog', () => openDialog());
  ipcMain.handle('mutxt:write-file', async (_event, filePath: string, bytes: Uint8Array) => {
    await fs.writeFile(filePath, bytes);
  });

  if (!app.isDefaultProtocolClient('mutxt')) {
    app.setAsDefaultProtocolClient('mutxt');
  }

  dispatchArg(process.argv, process.cwd());

  app.whenReady().then(() => {
    if (!isDev) registerAppProtocol();
    buildAppMenu();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

function buildAppMenu(): void {
  const isMac = process.platform === 'darwin';
  const sendCloseFile = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (!rendererReady) return;
    const wc = mainWindow.webContents;
    if (wc.isDestroyed() || wc.isCrashed()) return;
    wc.send('mutxt:close-file');
  };
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              {role: 'about'},
              {type: 'separator'},
              {role: 'services'},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideOthers'},
              {role: 'unhide'},
              {type: 'separator'},
              {role: 'quit'},
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        {label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => void openDialog()},
        {type: 'separator'},
        {label: 'Close File', accelerator: 'CmdOrCtrl+W', click: sendCloseFile},
        {label: 'Close Window', accelerator: 'CmdOrCtrl+Shift+W', role: 'close'},
        ...(isMac ? [] : ([{type: 'separator'}, {role: 'quit'}] as MenuItemConstructorOptions[])),
      ],
    },
    {role: 'editMenu'},
    {role: 'viewMenu'},
    {role: 'windowMenu'},
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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
