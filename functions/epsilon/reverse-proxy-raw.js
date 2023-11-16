import "../../utils/polyfills/URL";

const epsilon_worker_id = 1234; //Internal Epsilon ID.
const epsilonConfig = {
  origin: `c${epsilon_worker_id}.csd.dotomi.com`,
  path: "tag_path_raw",
  version: "1.2.1",
};

function isEpsilonDebugMode(request) {
  const url = new URL(request.url);
  // Change URL from public URL to use the origin URL
  const debugModeValue = getQueryParam(url, "dtm_worker_debug");
  if (debugModeValue == "true") {
    return true;
  }
  return false;
}

async function getWorkerDebugData(request) {
  let updatedRequestHeaders = getEpsilonHeaders(request);
  return JSON.stringify({
    "RP URL": request.url.toString(),
    "Origin URL": getEpsilonURL(request),
    Config: epsilonConfig,
    Headers: Array.from(request.headers.entries()).reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {}
    ),
    "Updated Headers": Array.from(updatedRequestHeaders.entries()).reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {}
    ),
  });
}

function getOriginHost(request) {
  return request.headers.get("Host");
}

function getQueryParam(url, param) {
  const queryParams = {};
  const queryString = url.query[0] === "?" ? url.query.substr(1) : url.query;
  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    queryParams[key] = decodeURIComponent(value);
  });
  return queryParams[param];
}

function getEpsilonHeaders(request) {
  let epsilonHeaders = new Headers(request.headers.entries());
  addEpsilonRequestHeaders(epsilonHeaders, getOriginHost(request));
  return epsilonHeaders;
}

function getEpsilonURL(request) {
  const url = new URL(request.url);
  const hostname = getOriginHost(request);
  return url
    .toString()
    .replace(
      `://${hostname}/${epsilonConfig.path}`,
      `://${epsilonConfig.origin}`
    );
}

function addEpsilonRequestHeaders(headers, originHost) {
  headers.set("X-Forwarded-Request-Path", "/" + epsilonConfig.path);
  headers.set("RP-Host", originHost);
}

async function handleEpsilonRequest(request) {
  const finalOriginURL = getEpsilonURL(request);
  const headers = getEpsilonHeaders(request);
  const init = {
    headers: headers,
    redirect: "manual",
    edgio: {
      origin: "epsilon-origin",
    },
  };
  let response = await fetch(finalOriginURL, init);

  // Check status of response from origin server.
  if (response.status >= 200 && response.status <= 399) {
    return response;
  }

  let err = "// status code: " + response.status + " " + response.statusText;
  throw new Error(err);
}

export async function handleHttpRequest(request, context) {
  if (isEpsilonDebugMode(request)) {
    const debugData = await getWorkerDebugData(request);
    return new Response(debugData, {
      status: 200,
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  }

  try {
    let response = await handleEpsilonRequest(request);
    return response;
  } catch (error) {
    /*
        Capture and mask error to avoid issues with Edgio.
        Customize this line or section to modify how the reverse-proxy responds when the origin returns an error.
    */
    let body = "// Unexpected Error at HandleHttpRequest: " + error;
    return new Response(body, { status: 200 });
  }
}
