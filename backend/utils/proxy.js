const MICROSERVICE_URL =
  process.env.MICROSERVICE_URL || "http://localhost:3001/dev";

async function proxyRequest(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 204) {
    return { status: 204, data: null };
  }

  const data = await response.json();
  return { status: response.status, data };
}

function microserviceUrl(path) {
  return `${MICROSERVICE_URL}${path}`;
}

module.exports = { proxyRequest, microserviceUrl, MICROSERVICE_URL };
