import "../../utils/polyfills/URL";

const epsilonConfig = {
  origin: "c1234.csd.dotomi.com",
  path: "/tag_path",
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

function getWorkerDebugData(request) {
  return JSON.stringify({
    "RP URL": request.url.toString(),
    "Origin URL": getNewOriginURL(request),
    Config: epsilonConfig,
    Headers: Array.from(request.headers.entries()).reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {}
    ),
  });
}

function getNewOriginURL(request) {
  const url = new URL(request.url);
  const hostname = getOriginHost(request);
  return url
    .toString()
    .replace(`://${hostname}/${config.proxyPath}`, `://${config.origin}`);
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
  const hostname = request.headers.get("Host");
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
        item.startsWith("cf_");
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
    const similarityScores = tags.map((tag) =>
      getSimilarityScore(responseBody, tag)
    );
    console.log(similarityScores);
    // if this tags script has a score in valid range for any approved tags pass
    if (similarityScores.some((score) => score > 0.9 && score < 1.0)) {
      similarityResultText = "Similarity Test passed";
      matchingTag = tags.filter(
        (tag) =>
          getSimilarityScore(tag, responseBody) > 0.9 &&
          getSimilarityScore(tag, responseBody) < 1.0
      )[0];
    }
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

export async function handleHttpRequest(request, context) {
  if (isEpsilonDebugMode(request)) {
    const debugData = getWorkerDebugData(request);
    return new Response(debugData, {
      status: 200,
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    });
  }

  const finalOriginURL = getEpsilonURL(request);
  const headers = getEpsilonHeaders(request);

  try {
    let response = await handleEpsilonRequest(finalOriginURL, headers, "");
    return response;
  } catch (error) {
    let body = "// Unexpected Error: " + error;
    return new Response(body, { status: 200 });
  }
}
