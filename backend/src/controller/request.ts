

import prisma from '../config/prisma.js'
import  type { Request,Response } from 'express';
import {validateCollectionOwnership} from '../utils/validation.js'



export const createRequest=async(req:Request,res:Response)=>{
    try {
        const {collectionId}=req.params;

    if(typeof collectionId!=='string')return res.status(400).json({message:"invalid id format"});
    const collId=parseInt(collectionId,10);

    if (isNaN(collId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const validation = await validateCollectionOwnership(collId, userId);
    if (!validation.isValid) { 
    const statusCode = validation.error === "Collection not found" ? 404 : 403;
    return res.status(statusCode).json({ message: validation.error });
}
    const {name, url, method, headers, authentication, body}=req.body;
    if(!name||!url||!method)return res.status(400).json({message:"bad request"});

    const api=await prisma.aPIRequest.create({
        data:{
            name,
            method,
            url,
            collectionId:collId,
            headers,
            authentication,
            body
            
        }
    })
    return res.status(201).json({api,message:"request created successfully"});

    } catch (error) {
        return res.status(500).json({message:"internal server error"});
    }

}

export const getRequest=async(req:Request,res:Response)=>{
     try {
        const {collectionId}=req.params;

    if(typeof collectionId!=='string')return res.status(400).json({message:"invalid id format"});
    const collId=parseInt(collectionId,10);

    if (isNaN(collId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const validation = await validateCollectionOwnership(collId, userId);
    if (!validation.isValid) { 
    const statusCode = validation.error === "Collection not found" ? 404 : 403;
    return res.status(statusCode).json({ message: validation.error });
}

    const api=await prisma.aPIRequest.findMany({
        where:{
            collectionId:collId
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    return res.status(200).json({api,message:"retrieved  successfully"});

    } catch (error) {
        return res.status(500).json({message:"internal server error"});
    }
}

export const updateRequest =async(req:Request,res:Response)=>{
    try {
        const {requestId}=req.params;
         if(typeof requestId!=='string')return res.status(400).json({message:"invalid id format"});
    const reqId=parseInt(requestId,10);

    if (isNaN(reqId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const request=await prisma.aPIRequest.findUnique({
        where:{id:reqId}
    })
    if(!request)return res.status(404).json({message:"no request found"});
    const validation = await validateCollectionOwnership(request?.collectionId, userId);
    if (!validation.isValid) { 
    const statusCode = validation.error === "Collection not found" ? 404 : 403;
    return res.status(statusCode).json({ message: validation.error });
    }
     const { name, url, method, body, headers, authentication } = req.body;

        const updatedApi = await prisma.aPIRequest.update({
            where: {
                id: reqId
            },
            data: { 
                name,
                url,
                method,
                body,
                headers,
                authentication
            }
        });
   return res.status(200).json({updatedApi, message:"Request updated successfully"});

    } catch (error) {
        return res.status(500).json({message:"internal server error"});
    }
}


export const deleteReq =async(req:Request,res:Response)=>{
    try {
        const {requestId}=req.params;
         if(typeof requestId!=='string')return res.status(400).json({message:"invalid id format"});
    const reqId=parseInt(requestId,10);

    if (isNaN(reqId)) {
      return res.status(400).json({ message: "Invalid collection ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user.id;

    const request=await prisma.aPIRequest.findUnique({
        where:{id:reqId}
    })
    if(!request)return res.status(404).json({message:"no request found"});
    const validation = await validateCollectionOwnership(request?.collectionId, userId);
    if (!validation.isValid) { 
    const statusCode = validation.error === "Collection not found" ? 404 : 403;
    return res.status(statusCode).json({ message: validation.error });
    }

         await prisma.aPIRequest.delete({
            where: {
                id: reqId
            },
            
        });
   return res.status(200).json({ message:"Request deleted successfully"});

    } catch (error) {
        return res.status(500).json({message:"internal server error"});
    }
}

