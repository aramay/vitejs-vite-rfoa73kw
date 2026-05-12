import './style.css';
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { Terminal } from '@xterm/xterm';
import "@xterm/xterm/css/xterm.css";

// console.log(FileList);
document.querySelector('#app').innerHTML = `
<div class="container">
  <div class="editor">
    <textarea>
      this is textarea
    </textarea>
  </div>
  <div class="preview">
    <iframe src="loading.html"></iframe>
  </div>
</div>
<div class="terminal"></div>
`;

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector('iframe');

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector('textarea');

/** @type {import("@webcontainer/api").WebContainer} */
/** @param { string } content */

/** @type { HTMLTextAreaElement | null } */
const terminalEl = document.querySelector('.terminal');

let webcontainerInstance;

async function installDependencies(terminal) {
  // Install dependencies
  console.log(`Starting install dependencies \n`);
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data)
      },
    })
  );
  // Wait for install command to exit
  // return installProcess.exit;
  console.log('installProcess', installProcess);
  const exitCode = await installProcess.exit;
  return exitCode;
}

async function startDevServer(terminal) {
  console.log('Starting dev server \n');
  // Run 'npm run start' to start the express app
  const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);

  serverProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data)
      }
    })
  )

  // wait for server ready event
  webcontainerInstance.on('server-ready', (port, url) => {
    console.log(`Server is ready on port ${port} ${url}`);
    return (iframeEl.src = url);
  });
}

async function writeIndexJS(content) {
  console.log('writeIndex file function called \n');
  await webcontainerInstance.fs.writeFile('/index.js', content);
}

window.addEventListener('load', async () => {
  textareaEl.value = files['index.js'].file.contents;
  // listen for input events in textarea
  textareaEl.addEventListener('input', (e) => {
    writeIndexJS(e.target.value);
  });

  // attach Terminal to terminalEl
  const terminal = new Terminal({
    convertEol: true,
  });
  terminal.open(terminalEl);
  //Call only once
  webcontainerInstance = await WebContainer.boot();
  console.log('webcontainer', webcontainerInstance);

  // mount files
  await webcontainerInstance.mount(files);

  // install dependencies
  const installExitCode = await installDependencies(terminal);

  if (installExitCode !== 0) {
    throw new Error('installation failed');
  }
  console.log(iframeEl.src);
  startDevServer(terminal);
  // confirm files are loaded
  // const packageJSON = await webcontainerInstance.fs.readFile(
  //   'package.json',
  //   'utf-8'
  // );

  // console.log(packageJSON);
});
