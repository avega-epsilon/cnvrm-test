import "../../utils/polyfills/URL";

const epsilon_worker_id = 1234; //Internal Epsilon ID.
const epsilonConfig = {
  origin: `c${epsilon_worker_id}.csd.dotomi.com`,
  path: "tag_path",
  version: "1.0.0",
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
    "svid",
    "dtm_gdpr_delete",
    "pluto2",
    "pluto",
    "fastclick",
    "rts",
    "cmp-data",
    "euconsent-v2-ptc",
    "dtm_gpc_optout",
  ], // https://legal.epsilon.com/eu/cookie-list
  // Location for cached template tag used to compare viability.
  template_tag_urls: [
    `https://tags.cnvrm.com/epsilon/tag/consent-tag.txt`,
    `https://tags.cnvrm.com/epsilon/tag/epsilon-tag.txt`,
  ],
};

function isPixelRequest(request) {
  const url = new URL(request.url);
  if (
    url.pathname
      .toString()
      .startsWith(`/${epsilonConfig.path}/profile/visit/px/1_0`)
  ) {
    return true;
  }
  return false;
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

async function getWorkerDebugData(request) {
  const tagTemplates = await getEpsilonTagTemplates(request);

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
    "Tag response count": tagTemplates.length,
    "Similarity Test Tags": tagTemplates,
  });
}

/** Based on Dice Algorithm
 * Provides score between 0 and 1 between two strings
 * 1 being an exact match 0 being less of a match.
 * */
function getSimilarityScore(str1, str2) {
  // Tokenize the input strings into arrays of words
  const tokenize = (str) =>
    str.toString().toLowerCase().split(/\W+/).filter(Boolean);
  const words1 = tokenize(str1);
  const words2 = tokenize(str2);

  // Create a set of unique words from both input strings
  const uniqueWords = new Set([...words1, ...words2]);

  // Create vectors for each input string, where each element represents the word frequency
  const vector1 = Array.from(uniqueWords).map((word) =>
    words1.includes(word) ? 1 : 0
  );
  const vector2 = Array.from(uniqueWords).map((word) =>
    words2.includes(word) ? 1 : 0
  );

  // Calculate the dot product of the two vectors
  const dotProduct = vector1.reduce(
    (acc, val, index) => acc + val * vector2[index],
    0
  );

  // Calculate the magnitude of each vector
  const magnitude1 = Math.sqrt(
    vector1.reduce((acc, val) => acc + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    vector2.reduce((acc, val) => acc + val * val, 0)
  );

  // Calculate the cosine similarity
  if (magnitude1 !== 0 && magnitude2 !== 0) {
    return dotProduct / (magnitude1 * magnitude2);
  } else {
    // Handle the case where one or both vectors have zero magnitude
    return 0;
  }
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

function updateEpsilonJStoPX(epsilon_url) {
  const url = new URL(epsilon_url);
  let pxUrl = url
    .toString()
    .replace(`/profile/visit/js/1_0`, `/profile/visit/px/1_0`);

  return pxUrl;
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

function addEpsilonRequestHeaders(headers, originHost) {
  headers.set("X-Forwarded-Request-Path", "/" + epsilonConfig.path);
  headers.set("RP-Host", originHost);
}

async function handleEpsilonPixelRequest(request) {
  const finalOriginURL = getEpsilonURL(request);
  const headers = getEpsilonHeaders(request);
  const init = {
    headers: headers,
    redirect: "manual",
    edgio: {
      origin: "epsilon-origin",
    },
  };
  return await fetch(finalOriginURL, init);
}

async function handleEpsilonRequest(request, tags) {
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
  let pxURL;

  // Check status of response from origin server.
  if (response.status >= 200 && response.status <= 399) {
    const responseBody = await response.text();
    const similarityScores = tags.map((tag) =>
      getSimilarityScore(responseBody, tag)
    );
    //// if this tags script has a score in valid range for any approved tags pass
    if (similarityScores.some((score) => score > 0.9 && score < 1.0)) {
      //pxURL = updateEpsilonJStoPX(request.url);
      //return Response.redirect(pxURL, 301);
      return response;
    }

    pxURL = updateEpsilonJStoPX(request.url);
    return Response.redirect(pxURL, 301);
  }

  let body = "// status code: " + response.status + " " + response.statusText;
  let responseHeaders = new Headers();
  responseHeaders.append("Content-Type", "application/javascript");
  return new Response(body, { status: 200, headers: responseHeaders });
}

// Respond with pixel call when similarity check fails.
// Add parameter to identify issue.
async function handleEpsilonValidationFailure(finalOriginURL) {}

async function getTemplateTag(url) {
  const response = await fetch(url, { edgio: { origin: "epsilon-tags" } });
  const body = await response.text();
  return body;
}

async function getEpsilonTagTemplates(request) {
  let tags = [];
  let tag;

  try {
    const results = await Promise.all(
      epsilonConfig.template_tag_urls.map((url) => getTemplateTag(url))
    );
    tags.push(...results);
  } catch (error) {
    tag = `// Unexpected error at getEpsilonTagTemplates: ${error}`;
    tags.push(tag);
  }
  return tags;
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

  if (isPixelRequest(request)) {
    try {
      let response = await handleEpsilonPixelRequest(request);
      return response;
    } catch (error) {
      return new Response(null, { status: 200 });
    }
  }

  let epsilonTags = [];
  let tags = [];
  try {
    tags = await getEpsilonTagTemplates(request);
  } catch (error) {
    let body = "// Unexpected Error at tag templates: " + error;
    return new Response(body, { status: 200 });
  }
  epsilonTags.push(...tags);

  try {
    let response = await handleEpsilonRequest(request, epsilonTags);
    return response;
  } catch (error) {
    let body = "// Unexpected Error at HandleHttpRequest: " + error;
    return new Response(body, { status: 200 });
  }
}
