import prisma from "../config/prisma.js";
import type { Request, Response } from "express";

interface CollectionParams {
  id: string;
}

interface CreateCollectionBody {
  name: string;
}

interface UpdateCollectionBody {
  name: string;
}

const validateCollectionOwnership = async (
  collectionId: number,
  userId: number
) => {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    return { isValid: false, error: "Collection not found" };
  }

  if (collection.userId !== userId) {
    return { isValid: false, error: "Unauthorized access" };
  }

  return { isValid: true, collection };
};

const createCollection = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    return res.status(201).json({
      message: "Collection created successfully",
      collection,
    });
  } catch (error) {
    console.error("Create collection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllCollections = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, 
      include: {
        _count: {
          select: { APIrequests: true },
        },
      },
    });

    return res.status(200).json({
      message: "Collections retrieved successfully",
      collections,
      count: collections.length,
    });
  } catch (error) {
    console.error("Get all collections error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCollectionById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    if(typeof id!=='string')return res.status(400).json({ message: "Invalid collection ID format" });
    const collectionId = parseInt(id, 10);

    if (isNaN(collectionId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const validation = await validateCollectionOwnership(collectionId, userId);

    if (!validation.isValid) {
      const statusCode = validation.error === "Collection not found" ? 404 : 403;
      return res.status(statusCode).json({ message: validation.error });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        APIrequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.status(200).json({
      message: "Collection retrieved successfully",
      collection,
    });
  } catch (error) {
    console.error("Get collection by ID error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateCollection = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name } = req.body;
     const { id } = req.params;
    if(typeof id!=='string')return res.status(400).json({ message: "Invalid collection ID format" });
    const collectionId = parseInt(id, 10);

    if (isNaN(collectionId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const validation = await validateCollectionOwnership(collectionId, userId);

    if (!validation.isValid) {
      const statusCode = validation.error === "Collection not found" ? 404 : 403;
      return res.status(statusCode).json({ message: validation.error });
    }
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: { name: name.trim() },
    });

    return res.status(200).json({
      message: "Collection updated successfully",
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Update collection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCollection = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    if(typeof id!=='string')return res.status(400).json({ message: "Invalid collection ID format" });
    const collectionId = parseInt(id, 10);

    if (isNaN(collectionId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const validation = await validateCollectionOwnership(collectionId, userId);

    if (!validation.isValid) {
      const statusCode = validation.error === "Collection not found" ? 404 : 403;
      return res.status(statusCode).json({ message: validation.error });
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return res.status(200).json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Delete collection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
};