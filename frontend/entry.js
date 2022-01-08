/**
 * Entry point into the extension.
 * Injects all required stylesheets and scripts.
 *
 * More info as to why this injectino procedure was used:
 * http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */

const injectScript = (file_path, isExtensionResource) => {
  if (isExtensionResource) {
    file_path = chrome.extension.getURL(file_path);
  }

  const body = document.getElementsByTagName("body")[0];
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  body.appendChild(script);
};

const injectStylesheet = (file_path, isExtensionResource) => {
  if (isExtensionResource) {
    file_path = chrome.extension.getURL(file_path);
  }

  const head = document.getElementsByTagName("head")[0];
  const stylesheet = document.createElement("link");
  stylesheet.setAttribute("rel", "stylesheet");
  stylesheet.setAttribute("href", file_path);
  head.appendChild(stylesheet);
};

const main = () => {
  // Inject stylesheets
  injectStylesheet("bootstrap.min.css", true);

  // Inject scripts
  injectScript("socket.io.min.js", true);
  injectScript("content-script.js", true);
};

main();
