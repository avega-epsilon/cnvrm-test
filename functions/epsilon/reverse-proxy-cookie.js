import "../../utils/polyfills/URL";

const epsilon_worker_id = 1234; //Internal Epsilon ID.
const epsilonConfig = {
  origin: `c${epsilon_worker_id}.csd.dotomi.com`,
  path: "tag_path_cookie",
  version: "1.1.1",
  epsilonCookieList: [
    "DotomiUser",
    "DotomiStatus",
    "dtm_token",
    "dtm_token_exp",
    "dtm_token_sc",
    `DotomiSession_${epsilon_worker_id}`,
    "euconsent-v2",
    "dtm_tcdata",
    "dtm_tcdata_exp",
    "dtm_token_sc",
    "DotomiSync",
    "dtm_user_id",
    "dtm_user_id_sc",
    "dtm_gdpr_delete",
    "rts",
    "cmp-data",
    "euconsent-v2-ptc",
    "dtm_gpc_optout",
  ], // https://legal.epsilon.com/eu/cookie-list
};

function getQueryParam(url, param) {
  const queryParams = {};
  const queryString = url.query[0] === "?" ? url.query.substr(1) : url.query;
  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    queryParams[key] = decodeURIComponent(value);
  });
  return queryParams[param];
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

function isEpsilonDebugMode(request) {
  const url = new URL(request.url);
  // Change URL from public URL to use the origin URL
  const debugModeValue = getQueryParam(url, "dtm_worker_debug");
  if (debugModeValue == "true") {
    return true;
  }
  return false;
}

function getOriginHost(request) {
  return request.headers.get("Host");
}

function filterForEpsilonCookies(headers) {
  // Check for cookie header, and if present filter to only allowed cookies.
  if (headers.has("cookie")) {
    // Split cookie header in to array of individual cookies
    const cookieHeader = headers.get("cookie");
    const cookies = cookieHeader.split(";");
    let newCookies = "";
    let cookiesCount = 0;

    // Iterate through each cookie, checking if is matches allowed cookie names
    cookies.forEach(function (item, index, array) {
      // Remove any whitespaces
      item = item.trim();
      // Check cookie name
      const cookieNameMatches =
        item.startsWith("dtm_") ||
        item.startsWith("Dotomi") ||
        epsilonConfig.epsilonCookieList.some((cookie) => item === cookie);
      if (cookieNameMatches && cookiesCount == 0) {
        // First cookie that matches allowed cookie names - add to newCookies
        newCookies += item;
        cookiesCount++;
      } else if (cookieNameMatches) {
        // Second or later cookie that matches allowed cookie names - and semicolon, space, and then cookie
        newCookies += "; " + item;
        cookiesCount++;
      }
    });

    // Add cookies that are allowed, or delete cookies header if none matched
    if (newCookies == "") {
      headers.delete("cookie");
    } else {
      headers.set("cookie", newCookies);
    }
  }
}

function getEpsilonHeaders(request) {
  let epsilonHeaders = new Headers(request.headers.entries());
  // Can be added if custom headers are not added via routing.
  addEpsilonRequestHeaders(epsilonHeaders, getOriginHost(request));
  filterForEpsilonCookies(epsilonHeaders); // only send through epsilon related cookies
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
