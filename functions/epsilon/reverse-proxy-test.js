import "../../utils/polyfills/URL";
import { epsilonTag } from "./epsilon-tag.js";

const epsilon_worker_id = 1234; //Internal Epsilon ID.
const epsilonConfig = {
  origin: `c${epsilon_worker_id}.csd.dotomi.com`,
  path: "tag_path_final",
  version: "0.8",
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
  consent_template_tag_path: "static/epsilon/tags/consent-tag.txt",
  epsilon_template_tag_path: "static/epsilon/tags/epsilon-tag.txt",
};

function shuffleString(s) {
  let a = s.split(""),
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
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
  const host = getOriginHost(request);
  //const consent_tag_url = `https://${host}/${epsilonConfig.path}/${epsilonConfig.consent_template_tag_path}`;
  //const epsilon_tag_url = `https://${host}/${epsilonConfig.path}/${epsilonConfig.epsilon_template_tag_path}`;
  const consent_tag_url = `https://tags.cnvrm.com/epsilon/tag/consent-tag.txt`;
  const epsilon_tag_url = `https://tags.cnvrm.com/epsilon/tag/epsilon-tag.txt`;
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
    "Epsilon Tag URL": epsilon_tag_url,
    "Epsilon Consent Tag URL": consent_tag_url,
    "Tag response count": tagTemplates.length,
    "Similarity Test Tags": tagTemplates,
  });
}

function getSimilarityScore2(payloadA, payloadB) {
  const setA = new Set(payloadA);
  const setB = new Set(payloadB);

  // Calculate intersection size
  const intersectionSize = new Set([...setA].filter((x) => setB.has(x))).size;

  // Calculate Sørensen-Dice coefficient
  const coefficient = (2.0 * intersectionSize) / (setA.size + setB.size);

  return coefficient;
}

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
  let epsilonHeaders = new Headers(request.headers);
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

function filterForEpsilonCookies(headers) {
  // Check for cookie header, and if present filter to only allowed cookies.
  if (headers.has("Cookie")) {
    // Split cookie header in to array of individual cookies
    const cookieHeader = headers.get("Cookie");
    const cookies = cookieHeader.split(";");
    var newCookies = "";
    var cookiesCount = 0;

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
      headers.delete("Cookie");
    } else {
      headers.set("Cookie", newCookies);
    }
  }
}

function addEpsilonRequestHeaders(headers, originHost) {
  headers.set("X-Forwarded-Request-Path", "/" + epsilonConfig.path);
  headers.set("RP-Host", originHost);
}

async function handleEpsilonRequest(finalOriginURL, headers, tags) {
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
    const responseBody = await response.text();
    let similarityResultText = "Similarity Test did not pass";
    let matchingTag = "";
    //const similarityScores = [];
    //const similarityScores = [getSimilarityScore2(responseBody, tags[0])];
    const similarityScores = tags.map((tag) =>
      getSimilarityScore(responseBody, tag)
    );
    //// if this tags script has a score in valid range for any approved tags pass
    //if (similarityScores.some((score) => score > 0.9 && score < 1.0)) {
    //  similarityResultText = "Similarity Test passed";
    //}
    let body =
      "// status code: " +
      response.status +
      " " +
      response.statusText +
      ", similarity scores: " +
      similarityScores +
      ", " +
      similarityResultText +
      "\n" +
      matchingTag +
      "\n------\n" +
      responseBody;

    let responseHeaders = new Headers();
    responseHeaders.append("Content-Type", "application/javascript");
    return new Response(body, { status: 200, headers: responseHeaders });
  }

  let body = "// status code: " + response.status + " " + response.statusText;
  let responseHeaders = new Headers();
  responseHeaders.append("Content-Type", "application/javascript");
  return new Response(body, { status: 200, headers: responseHeaders });
}

// Respond with pixel call when similarity check fails.
// Add parameter to identify issue.
async function handleSimilarityCheckFailure(request) {}

async function getTemplateTag(url) {
  //response = await fetch(url, { edgio: { origin: "edgio_static" } });
  //const response = await fetch(url, { edgio: { origin: "function-origin" } });
  //const response = await fetch(url, { edgio: { origin: "edgio_serverless" } });
  const response = await fetch(url, { edgio: { origin: "epsilon-tags" } });
  const body = await response.text();
  return body;
}

async function getEpsilonTagTemplates(request) {
  const consent_tag_url = `https://tags.cnvrm.com/epsilon/tag/consent-tag.txt`;
  const epsilon_tag_url = `https://tags.cnvrm.com/epsilon/tag/epsilon-tag.txt`;
  let tags = [];
  let tag;

  //tag = epsilonTag; // in memory tag

  //let response = await fetch(epsilon_tag_url, {
  //  edgio: { origin: "function-origin" },
  //});
  //tag = await response.text();

  try {
    const [consent_tag, epsilon_tag] = await Promise.all([
      getTemplateTag(epsilon_tag_url),
      getTemplateTag(consent_tag_url),
    ]);
    // Test algorithm with string shuffle.
    tags.push(...[consent_tag, epsilon_tag]);
    tags.push(...[shuffleString(consent_tag), shuffleString(epsilon_tag)]);

    //tag = await getTemplateTag(consent_tag_url);
    //console.log(tag.length);
    //console.log(tag);
    //tags.push(tag);
    //tag = await getTemplateTag(epsilon_tag_url);
    //console.log(tag.length);

    //// test one url fetch
    //let response = await fetch(epsilon_tag_url, {
    //  edgio: { origin: "function-origin" },
    //});
    //tag = await response.text();

    //let tag = epsilonTag; // in memory tag
  } catch (error) {
    tag = `// Unexpected error at getEpsilonTagTemplates: ${error}`;
    tags.push(tag);
  }

  tags.push("// fail case some malicious unexpected javascript here.");
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

  const finalOriginURL = getEpsilonURL(request);
  const headers = getEpsilonHeaders(request);
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
    let response = await handleEpsilonRequest(
      finalOriginURL,
      headers,
      epsilonTags
    );
    return response;
  } catch (error) {
    let body = "// Unexpected Error at HandleHttpRequest: " + error;
    return new Response(body, { status: 200 });
  }
}
