export const httpStatusCodes: { [key: number]: HttpStatusCodeWithDescription } = {
  200: { code: 200, description: "OK: The request was successful.", category: "Success" },
  201: {
    code: 201,
    description: "Created: The resource was successfully created.",
    category: "Success",
  },
  202: {
    code: 202,
    description:
      "Accepted: The request has been accepted for processing, but the processing has not been completed.",
    category: "Success",
  },
  203: {
    code: 203,
    description:
      "Non-Authoritative Information: The server successfully processed the request, but is returning information that may be from another source.",
    category: "Success",
  },
  204: {
    code: 204,
    description: "No Content: The request was successful, but there is no content to return.",
    category: "Success",
  },
  205: {
    code: 205,
    description:
      "Reset Content: The server successfully processed the request, but is requesting that the client reset the document view.",
    category: "Success",
  },
  206: {
    code: 206,
    description:
      "Partial Content: The server is delivering only part of the resource due to a range header sent by the client.",
    category: "Success",
  },
  400: {
    code: 400,
    description:
      "Bad Request: The server could not understand the request due to malformed syntax.",
    category: "Client Error",
  },
  401: {
    code: 401,
    description: "Unauthorized: The client must authenticate itself to get the requested response.",
    category: "Client Error",
  },
  402: {
    code: 402,
    description: "Payment Required: This code is reserved for future use.",
    category: "Client Error",
  },
  403: {
    code: 403,
    description: "Forbidden: The server understood the request, but refuses to authorize it.",
    category: "Client Error",
  },
  404: {
    code: 404,
    description: "Not Found: The server cannot find the requested resource.",
    category: "Client Error",
  },
  405: {
    code: 405,
    description: "Method Not Allowed: The request method is not supported by the resource.",
    category: "Client Error",
  },
  406: {
    code: 406,
    description:
      "Not Acceptable: The server cannot produce a response matching the list of acceptable values defined in the request's headers.",
    category: "Client Error",
  },
  407: {
    code: 407,
    description:
      "Proxy Authentication Required: The client must first authenticate itself with the proxy.",
    category: "Client Error",
  },
  408: {
    code: 408,
    description: "Request Timeout: The server timed out waiting for the request.",
    category: "Client Error",
  },
  409: {
    code: 409,
    description:
      "Conflict: The request could not be completed due to a conflict with the current state of the resource.",
    category: "Client Error",
  },
  410: {
    code: 410,
    description: "Gone: The resource is no longer available and will not be available again.",
    category: "Client Error",
  },
  411: {
    code: 411,
    description:
      "Length Required: The server refuses to process the request because the `Content-Length` header is not defined.",
    category: "Client Error",
  },
  412: {
    code: 412,
    description:
      "Precondition Failed: The server does not meet one of the preconditions that the requester put on the request.",
    category: "Client Error",
  },
  413: {
    code: 413,
    description:
      "Payload Too Large: The request is larger than the server is willing or able to process.",
    category: "Client Error",
  },
  414: {
    code: 414,
    description: "URI Too Long: The URI provided was too long for the server to process.",
    category: "Client Error",
  },
  415: {
    code: 415,
    description:
      "Unsupported Media Type: The server cannot process the request due to unsupported media type.",
    category: "Client Error",
  },
  416: {
    code: 416,
    description:
      "Range Not Satisfiable: The client has asked for a portion of the file, but the server cannot supply that portion.",
    category: "Client Error",
  },
  417: {
    code: 417,
    description:
      "Expectation Failed: The server cannot meet the requirements of the Expect request-header field.",
    category: "Client Error",
  },
  418: {
    code: 418,
    description:
      "I'm a teapot: Any attempt to instruct an teapot to brew coffee should result in the error code 418 I'm a teapot.",
    category: "Client Error",
  },
  421: {
    code: 421,
    description:
      "Misdirected Request: The request was directed at a server that is not able to produce a response.",
    category: "Client Error",
  },
  422: {
    code: 422,
    description:
      "Unprocessable Entity: The request was well-formed, but was unable to be followed due to semantic errors.",
    category: "Client Error",
  },
  423: {
    code: 423,
    description: "Locked: The resource that is being accessed is locked.",
    category: "Client Error",
  },
  424: {
    code: 424,
    description: "Failed Dependency: The request failed due to failure of a previous request.",
    category: "Client Error",
  },
  425: {
    code: 425,
    description:
      "Too Early: The server is unwilling to risk processing a request that might be replayed.",
    category: "Client Error",
  },
  426: {
    code: 426,
    description: "Upgrade Required: The client should switch to a different protocol.",
    category: "Client Error",
  },
  428: {
    code: 428,
    description: "Precondition Required: The origin server requires the request to be conditional.",
    category: "Client Error",
  },
  429: {
    code: 429,
    description:
      "Too Many Requests: The user has sent too many requests in a given amount of time.",
    category: "Client Error",
  },
  431: {
    code: 431,
    description:
      "Request Header Fields Too Large: The server is unwilling to process the request because its header fields are too large.",
    category: "Client Error",
  },
  451: {
    code: 451,
    description:
      "Unavailable For Legal Reasons: The server is denying access to the resource as a consequence of a legal demand.",
    category: "Client Error",
  },
  500: {
    code: 500,
    description: "Internal Server Error: The server encountered an unexpected condition.",
    category: "Server Error",
  },
  501: {
    code: 501,
    description:
      "Not Implemented: The server does not support the functionality required to fulfill the request.",
    category: "Server Error",
  },
  502: {
    code: 502,
    description: "Bad Gateway: The server received an invalid response from an upstream server.",
    category: "Server Error",
  },
  503: {
    code: 503,
    description: "Service Unavailable: The server is temporarily unable to handle the request.",
    category: "Server Error",
  },
  504: {
    code: 504,
    description:
      "Gateway Timeout: The server did not receive a timely response from an upstream server.",
    category: "Server Error",
  },
  505: {
    code: 505,
    description:
      "HTTP Version Not Supported: The server does not support the HTTP protocol version.",
    category: "Server Error",
  },
  506: {
    code: 506,
    description:
      "Variant Also Negotiates: The server has an internal configuration error: transparent content negotiation for the request results in a circular reference.",
    category: "Server Error",
  },
  507: {
    code: 507,
    description:
      "Insufficient Storage: The server is unable to store the representation needed to complete the request.",
    category: "Server Error",
  },
  508: {
    code: 508,
    description: "Loop Detected: The server detected an infinite loop while processing a request.",
    category: "Server Error",
  },
  510: {
    code: 510,
    description:
      "Not Extended: The server is unwilling to process the request because the necessary extensions are required.",
    category: "Server Error",
  },
  511: {
    code: 511,
    description:
      "Network Authentication Required: The client needs to authenticate to gain network access.",
    category: "Server Error",
  },
};
