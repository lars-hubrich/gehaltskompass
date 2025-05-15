import { GET, POST } from "./route";

// Mock the Prisma client
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Import the mocked Prisma client
import prisma from "@/lib/prisma";

describe("Posts API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return all posts", async () => {
      // Mock data
      const mockPosts = [
        {
          id: 1,
          title: "Test Post 1",
          content: "Content 1",
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Test Post 2",
          content: "Content 2",
          createdAt: new Date(),
        },
      ];

      // Mock the Prisma findMany method
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

      // Call the GET function
      const response = await GET();

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(await response.json()).toEqual(mockPosts);

      // Verify that Prisma was called correctly
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("POST", () => {
    it("should create a new post", async () => {
      // Mock data
      const newPost = { title: "New Post", content: "New Content" };
      const createdPost = { id: 3, ...newPost, createdAt: new Date() };

      // Mock the request
      const request = {
        json: jest.fn().mockResolvedValue(newPost),
      } as unknown as Request;

      // Mock the Prisma create method
      (prisma.post.create as jest.Mock).mockResolvedValue(createdPost);

      // Call the POST function
      const response = await POST(request);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(await response.json()).toEqual(createdPost);
      expect(response.status).toBe(201);

      // Verify that Prisma was called correctly
      expect(prisma.post.create).toHaveBeenCalledWith({ data: newPost });
    });

    it("should handle missing fields", async () => {
      // Mock data with missing content
      const incompletePost = { title: "Incomplete Post" };

      // Mock the request
      const request = {
        json: jest.fn().mockResolvedValue(incompletePost),
      } as unknown as Request;

      // Mock the Prisma create method
      (prisma.post.create as jest.Mock).mockResolvedValue({
        id: 4,
        ...incompletePost,
        content: null,
        createdAt: new Date(),
      });

      // Call the POST function
      const response = await POST(request);

      // Verify the response
      expect(response).toBeDefined();
      expect(response.json).toBeDefined();
      expect(response.status).toBe(201);

      // Verify that Prisma was called correctly
      expect(prisma.post.create).toHaveBeenCalledWith({ data: incompletePost });
    });
  });
});
