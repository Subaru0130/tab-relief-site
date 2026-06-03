import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".tmp");
const profileDir = path.join(outDir, "chrome-profile");
const chromeBin = process.env.CHROME_BIN || "chrome";
const pageUrl = `${pathToFileURL(path.join(root, "index.html")).toString()}?lang=en`;
const jaPageUrl = `${pathToFileURL(path.join(root, "ja", "index.html")).toString()}?lang=ja`;

await mkdir(outDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });

const chrome = spawn(chromeBin, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--allow-file-access-from-files",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

const endpoint = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Timed out waiting for Chrome DevTools endpoint.")), 10000);
  chrome.stderr.on("data", chunk => {
    const text = String(chunk);
    const match = text.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) {
      clearTimeout(timer);
      resolve(match[1]);
    }
  });
  chrome.on("error", reject);
  chrome.on("exit", code => {
    if (code !== null) reject(new Error(`Chrome exited early with code ${code}.`));
  });
});

const client = await connect(await getPageEndpoint(endpoint));

try {
  await send(client, "Page.enable");
  await capture(client, {
    name: "home-desktop.png",
    width: 1440,
    height: 1200,
    mobile: false
  });
  await capture(client, {
    name: "home-full-desktop.png",
    width: 1440,
    height: 1200,
    mobile: false,
    fullPage: true
  });
  await capture(client, {
    name: "home-mobile.png",
    width: 390,
    height: 1600,
    mobile: true
  });
  await capture(client, {
    name: "home-ja-desktop.png",
    width: 1440,
    height: 1200,
    mobile: false,
    url: jaPageUrl
  });
  await capture(client, {
    name: "home-ja-full-desktop.png",
    width: 1440,
    height: 1200,
    mobile: false,
    fullPage: true,
    url: jaPageUrl
  });
  await capture(client, {
    name: "home-ja-mobile.png",
    width: 390,
    height: 1600,
    mobile: true,
    url: jaPageUrl
  });
} finally {
  client.close();
  chrome.kill();
}

console.log(`Captured previews in ${outDir}`);

async function capture(client, viewport) {
  await send(client, "Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });
  const load = onceEvent(client, "Page.loadEventFired");
  const targetUrl = viewport.url || pageUrl;
  const separator = targetUrl.includes("?") ? "&" : "?";
  await send(client, "Page.navigate", { url: `${targetUrl}${separator}v=${Date.now()}` });
  await load;
  await send(client, "Runtime.evaluate", {
    expression: "document.fonts ? document.fonts.ready : Promise.resolve()",
    awaitPromise: true
  });
  const metrics = await send(client, "Runtime.evaluate", {
    expression: "JSON.stringify({ innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth })",
    returnByValue: true
  });
  const parsedMetrics = JSON.parse(metrics.result.value);
  const screenshotOptions = {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  };
  if (viewport.fullPage) {
    const layout = await send(client, "Page.getLayoutMetrics");
    screenshotOptions.captureBeyondViewport = true;
    screenshotOptions.clip = {
      x: 0,
      y: 0,
      width: Math.ceil(layout.contentSize.width),
      height: Math.ceil(layout.contentSize.height),
      scale: 1
    };
  }
  const screenshot = await send(client, "Page.captureScreenshot", screenshotOptions);
  await writeFile(path.join(outDir, viewport.name), Buffer.from(screenshot.data, "base64"));
  console.log(`${viewport.name}: ${JSON.stringify(parsedMetrics)}`);
}

function connect(endpoint) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(endpoint);
    const callbacks = new Map();
    const events = new Map();
    let id = 0;

    ws.onopen = () => {
      ws.sendCommand = (method, params = {}) => new Promise((res, rej) => {
        const messageId = ++id;
        callbacks.set(messageId, { res, rej });
        ws.send(JSON.stringify({ id: messageId, method, params }));
      });
      ws.waitForEvent = method => new Promise(res => {
        if (!events.has(method)) events.set(method, []);
        events.get(method).push(res);
      });
      resolve(ws);
    };

    ws.onerror = reject;
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && callbacks.has(message.id)) {
        const callback = callbacks.get(message.id);
        callbacks.delete(message.id);
        if (message.error) callback.rej(new Error(message.error.message));
        else callback.res(message.result || {});
        return;
      }
      const listeners = events.get(message.method);
      if (listeners?.length) listeners.shift()(message.params || {});
    };
  });
}

async function getPageEndpoint(browserEndpoint) {
  const endpointUrl = new URL(browserEndpoint);
  const targets = await fetch(`http://${endpointUrl.host}/json/list`).then(response => response.json());
  const page = targets.find(target => target.type === "page" && target.webSocketDebuggerUrl);
  if (!page) {
    throw new Error("Could not find a Chrome page target for preview capture.");
  }
  return page.webSocketDebuggerUrl;
}

function send(client, method, params) {
  return client.sendCommand(method, params);
}

function onceEvent(client, method) {
  return client.waitForEvent(method);
}
