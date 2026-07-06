/* global console */
import { randomUUID } from 'node:crypto';

const MAX_TEXT_LENGTH = 1000;
const MAX_STACK_LENGTH = 4000;

function jsonResponse(response, statusCode, body, requestId) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  if (requestId) response.setHeader('x-request-id', requestId);
  response.end(JSON.stringify(body));
}

function readHeader(request, name) {
  const value = request.headers?.[name];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : '';
}

function createRequestId(request) {
  return readHeader(request, 'x-vercel-id') || readHeader(request, 'x-request-id') || randomUUID();
}

function trimText(value, maxLength) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function readSafeBody(request) {
  const body = request.body && typeof request.body === 'object' ? request.body : {};
  return {
    message: trimText(body.message, MAX_TEXT_LENGTH),
    stack: trimText(body.stack, MAX_STACK_LENGTH),
    source: trimText(body.source, 120),
    route: trimText(body.route, 300),
    componentStack: trimText(body.componentStack, MAX_STACK_LENGTH),
    userAgent: trimText(body.userAgent, 500),
    timestamp: trimText(body.timestamp, 80),
  };
}

function logClientError(requestId, payload) {
  console.error(JSON.stringify({
    level: 'error',
    timestamp: new Date().toISOString(),
    msg: 'client_error',
    route: '/api/client-error',
    requestId,
    ...payload,
  }));
}

export default async function handler(request, response) {
  const requestId = createRequestId(request);

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return jsonResponse(response, 405, { error: 'Method not allowed.', requestId }, requestId);
  }

  const payload = readSafeBody(request);
  logClientError(requestId, payload);

  return jsonResponse(response, 200, { ok: true, requestId }, requestId);
}
