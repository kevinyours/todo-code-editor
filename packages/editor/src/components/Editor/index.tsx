import React, { FC, useEffect, useRef } from 'react';

import 'monaco-editor/esm/vs/editor/editor.all.js';

// support all editor features
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
import {
  CloseAction,
  ErrorAction,
  MessageTransports,
  MonacoLanguageClient,
  MonacoServices,
} from 'monaco-languageclient';
import normalizeUrl from 'normalize-url';
import {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from 'vscode-ws-jsonrpc';
import getMessageServiceOverride from 'vscode/service-override/messages';
import { StandaloneServices } from 'vscode/services';

function createLanguageClient(
  transports: MessageTransports
): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['typescript'],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
}

function createUrl(hostname: string, port: number, path: string): string {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
}

StandaloneServices.initialize({
  ...getMessageServiceOverride(document.body),
});

buildWorkerDefinition('dist', new URL('', window.location.href).href, false);

interface EditorProps {
  language: string;
}

const Editor: FC<EditorProps> = (props) => {
  let ref = useRef(null);
  const value = "const greeting:string = 'Hello'";

  useEffect(() => {
    if (ref.current) {
      monaco.languages.register({
        id: 'typescript',
        extensions: ['.ts'],
        aliases: ['TypeScript', 'ts', 'TS', 'Typescript', 'typescript'],
      });

      monaco.editor.create(ref.current, {
        model: monaco.editor.createModel(
          value,
          'typescript',
          monaco.Uri.parse('inmemory://model.json')
        ),
        language: props.language,
        minimap: { enabled: true },
        autoIndent: 'full',
        theme: 'vs-dark',
        mouseWheelZoom: true,
        fontSize: 25,
      });

      MonacoServices.install();

      const url = createUrl('localhost', 3000, '/ts');
      const webSocket = new WebSocket(url);

      webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({
          reader,
          writer,
        });
        languageClient.start();
        reader.onClose(() => languageClient.stop());
      };
    }
  }, [ref]);

  return <div ref={ref} className="editor-container" />;
};

export default Editor;
