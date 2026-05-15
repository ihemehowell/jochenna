import { NextRequest, NextResponse } from "next/server";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function logProxyEvent(level: "info" | "warn" | "error", message: string, details?: unknown) {
  const prefix = "[jochenna-proxy]";

  if (level === "info") {
    console.info(prefix, message, details ?? "");
    return;
  }

  if (level === "warn") {
    console.warn(prefix, message, details ?? "");
    return;
  }

  console.error(prefix, message, details ?? "");
}

function resolveBackendBaseUrl(): string | null {
  const configuredBaseUrl =
    process.env.BACKEND_URL?.trim() || process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!configuredBaseUrl) {
    return process.env.NODE_ENV === "production" ? null : "http://localhost:5000";
  }

  try {
    return new URL(configuredBaseUrl).toString().replace(/\/$/, "");
  } catch {
    return process.env.NODE_ENV === "production" ? null : "http://localhost:5000";
  }
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const backendBaseUrl = resolveBackendBaseUrl();

  if (!backendBaseUrl) {
    logProxyEvent("error", "Backend URL is missing for this deployment.");
    return NextResponse.json(
      { message: "Backend URL is not configured for this deployment." },
      { status: 500 }
    );
  }

  const { path = [] } = await context.params;
  const targetPath = path.join("/");
  const targetUrl = `${backendBaseUrl}/api/${targetPath}${request.nextUrl.search}`;

  logProxyEvent("info", "Proxying request.", {
    method: request.method,
    targetUrl,
  });

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstreamResponse = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstreamResponse.headers);

  HOP_BY_HOP_HEADERS.forEach((headerName) => responseHeaders.delete(headerName));

  if (!upstreamResponse.ok) {
    const body = await upstreamResponse.clone().text();
    logProxyEvent("error", "Upstream API returned a non-ok response.", {
      method: request.method,
      targetUrl,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      body,
    });
  } else {
    logProxyEvent("info", "Upstream API request succeeded.", {
      method: request.method,
      targetUrl,
      status: upstreamResponse.status,
    });
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, context);
}

export function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, context);
}

export function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, context);
}

export function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, context);
}

export function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, context);
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
