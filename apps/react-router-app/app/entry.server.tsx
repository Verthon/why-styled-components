import { PassThrough, Transform } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import {
  ServerStyleSheet,
  StyleSheetManager,
} from "styled-components";
import { AppProviders } from "@why/core";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  const sheet = new ServerStyleSheet();

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000,
    );

    const { pipe, abort } = renderToPipeableStream(
      <StyleSheetManager sheet={sheet.instance}>
        <AppProviders>
          <ServerRouter context={routerContext} url={request.url} />
        </AppProviders>
      </StyleSheetManager>,
      {
        [readyOption]() {
          shellRendered = true;

          const styleTags = sheet.getStyleTags();
          sheet.seal();

          const injectStyledComponentsIntoHead = new Transform({
            transform(chunk, _enc, cb) {
              const html = chunk.toString();
              if (html.includes("</head>")) {
                cb(null, html.replace("</head>", `${styleTags}</head>`));
              } else {
                cb(null, chunk);
              }
            },
          });

          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });

          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          pipe(injectStyledComponentsIntoHead);
          injectStyledComponentsIntoHead.pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          sheet.seal();
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );
  });
}
