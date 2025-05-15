import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "./route";

// Mock the Prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Import the mocked Prisma client
import prisma from "@/lib/prisma";

describe("Post API [id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create params object
  const createParams = (id: string) => {
    return {
      params: Promise.resolve({ id }),
    };
  };

  describe("GET", () => {
    it("should return a post when it exists", async () => {
      // Mock data
      const mockPost = {
        id: 1,
        title: "Test Post",
        content: "Content",
        createdAt: new Date(),
      };

      // Mock the Prisma findUnique method
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      // Create request and params
      const request = {} as NextRequest;
      const params = createParams("1");

      // Call the GET function
      const response = await GET(request, params);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(await response.json()).toEqual(mockPost);

      // Verify that Prisma was called correctly
      expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 404 when post does not exist", async () => {
      // Mock the Prisma findUnique method to return null (post not found)
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      // Create request and params
      const request = {} as NextRequest;
      const params = createParams("999");

      // Call the GET function
      const response = await GET(request, params);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Not Found" });

      // Verify that Prisma was called correctly
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe("PATCH", () => {
    it("should update a post", async () => {
      // Mock data
      const updateData = { title: "Updated Title", content: "Updated Content" };
      const updatedPost = { id: 1, ...updateData, createdAt: new Date() };

      // Mock the request
      const request = {
        json: jest.fn().mockResolvedValue(updateData),
      } as unknown as NextRequest;

      // Mock the Prisma update method
      (prisma.post.update as jest.Mock).mockResolvedValue(updatedPost);

      // Create params
      const params = createParams("1");

      // Call the PATCH function
      const response = await PATCH(request, params);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(await response.json()).toEqual(updatedPost);

      // Verify that Prisma was called correctly
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it("should handle partial updates", async () => {
      // Mock data with only title update
      const updateData = { title: "Only Title Updated" };
      const updatedPost = {
        id: 1,
        title: "Only Title Updated",
        content: "Original Content",
        createdAt: new Date(),
      };

      // Mock the request
      const request = {
        json: jest.fn().mockResolvedValue(updateData),
      } as unknown as NextRequest;

      // Mock the Prisma update method
      (prisma.post.update as jest.Mock).mockResolvedValue(updatedPost);

      // Create params
      const params = createParams("1");

      // Call the PATCH function
      const response = await PATCH(request, params);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(await response.json()).toEqual(updatedPost);

      // Verify that Prisma was called correctly
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe("DELETE", () => {
    it("should delete a post", async () => {
      // Mock the Prisma delete method
      (prisma.post.delete as jest.Mock).mockResolvedValue(undefined);

      // Create request and params
      const request = {} as NextRequest;
      const params = createParams("1");

      // Call the DELETE function
      const response = await DELETE(request, params);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.status).toBe(204);
      expect(await response.text()).toBe("");

      // Verify that Prisma was called correctly
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
