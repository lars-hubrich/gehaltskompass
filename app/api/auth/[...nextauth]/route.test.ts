/**
 * @jest-environment node
 */
jest.mock("next-auth", () => jest.fn(() => "handler"));
jest.mock("@/lib/auth", () => ({ authOptions: { some: "config" } }));

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { GET, POST } from "./route";

describe("auth route", () => {
  it("exports NextAuth handler for GET and POST", () => {
    expect(NextAuth).toHaveBeenCalledWith(authOptions);
    expect(GET).toBe("handler");
    expect(POST).toBe("handler");
  });
});
