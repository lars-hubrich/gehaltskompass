import "@testing-library/jest-dom";

// Mock global objects needed for Next.js
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      return {
        json: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve(init?.body ? JSON.parse(init.body as string) : {}),
          ),
      } as unknown as Request;
    }
  } as unknown as typeof Request;
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {
    status: number;
    statusText: string;
    headers: Headers;
    body: BodyInit | null | undefined;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.headers = new Headers(init?.headers);
      this.body = body;
      return this;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body as string));
    }

    text() {
      return Promise.resolve(this.body || "");
    }
  } as unknown as typeof Response;
}

// Mock NextResponse
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => {
        return {
          status: init?.status || 200,
          json: () => Promise.resolve(body),
        };
      }),
    },
  };
});
