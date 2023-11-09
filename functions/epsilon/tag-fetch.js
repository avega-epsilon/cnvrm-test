import "../../utils/polyfills/URL";

const config = {
  proxyPath: "tag_path/static", // The file-path prefix to identify calls to be proxied.
  origin: "c80611.csd.dotomi.com", // The host that requests should be proxied to.
  tagJs: {
    url: "https://c1234.csd.dotomi.com/profile/visit/js/1_0?dtm_cid=81274&dtm_cmagic=a8a5b9&dtm_fid=101&wl_override=apache.cnvrm.com&dtm_country_code=US",
    path: `epsilon/tags/epsilon-tag.txt`,
  },
  consentTagJs: {
    url: "https://c1234.csd.dotomi.com/profile/visit/js/1_0?dtm_cid=81274&dtm_cmagic=a8a5b9&dtm_fid=101&wl_override=apache.cnvrm.com&dtm_country_code=FR",
    path: `epsilon/tags/consent-tag.txt`,
  },
};

function addEpsilonRequestHeaders(headers, originHost) {
  headers.set("X-Forwarded-Request-Path", "/tag_path");
  headers.set("RP-Host", "apache.cnvrm.com");

  // Check for "cf-pseudo-ipv4" header to determine if "Pseudo IPv4" is enabled in Network settings.
  // If it is present, add true IPv6 address from "cf-connecting-ipv6" header to "x-forwarded-for" header.
  const cfPseudoIpv4 = headers.get("cf-pseudo-ipv4");
  // This will return either the pseudo IPv4 address or null if the header is not present.
  if (cfPseudoIpv4 !== null) {
    const cfConnectingIpv6 = headers.get("cf-connecting-ipv6");
    headers.append("X-Forwarded-For", cfConnectingIpv6);
  }
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

function getOriginHost(request) {
  return request.headers.get("Host");
}

function getEpsilonHeaders(request) {
  let epsilonHeaders = new Headers(request.headers);
  addEpsilonRequestHeaders(epsilonHeaders, getOriginHost(request));
  filterForEpsilonCookies(epsilonHeaders); // only send through epsilon related cookies
  return epsilonHeaders;
}

function isValidEpsilonPath(request) {
  const url = new URL(request.url);
  const urlMatchesProxyPath =
    url.pathname.startsWith("/" + config.proxyPath + "/") ||
    url.pathname === "/" + config.proxyPath;
  return urlMatchesProxyPath;
}

// removes variable object from basic tag.
function cleanTag(tag_raw) {
  let data = tag_raw.split("\n");
  let dataFiltered = data.filter(
    (line) => !line.includes("var integration = JSON.parse")
  );
  return dataFiltered.join("\n");
}

// Returns epsilon js template markup
async function getEpsilonTagTemplate(url) {
  let epsilonJS = "";
  let response = await fetch(url, { edgio: { origin: "epsilon-origin" } });
  let body = await response.text();
  epsilonJS = cleanTag(body);
  return epsilonJS;
}

/** TODO
 * * Pull correct tag asset
 *   []tag
 *   []consent
 * []Update asset with cache expiry.
 **/
export async function handleHttpRequest(request, context) {
  if (!isValidEpsilonPath(request)) {
    return new Response("403 Forbidden", {
      status: 403,
      headers: { "Cache-Control": "max-age=0" },
    });
  }

  let tagLocationURL;
  const url = new URL(request.url);
  if (url.pathname.endsWith(config.tagJs.path)) {
    tagLocationURL = config.tagJs.url;
  } else if (url.pathname.endsWith(config.consentTagJs.path)) {
    tagLocationURL = config.consentTagJs.url;
  } else {
    return new Response("403 Forbidden", {
      status: 403,
      headers: { "Cache-Control": "max-age=0" },
    });
  }

  let epsilonJS;
  //  Fetch basic tag if cache has expired.
  try {
    epsilonJS = await getEpsilonTagTemplate(tagLocationURL);
    return new Response(epsilonJS);
  } catch (error) {
    return new Response(`Unexpected error: ${error}`, {
      status: 200,
      headers: { "Cache-Control": "max-age=0" },
    });
  }
}
