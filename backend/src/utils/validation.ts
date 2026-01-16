import prisma from '../config/prisma.js'

export const validateCollectionOwnership = async (
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