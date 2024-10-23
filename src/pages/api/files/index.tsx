import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";
import { getTestUser } from '@/middleware';

export const dynamic = 'force-dynamic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "POST") {
    try {
      let { userId } = getAuth(req)

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        } else {
          userId = req.headers.authorization?.split("Bearer ")[1] as string
        }     
      }

      const keyData = await pinata.keys.create({ keyName: `${userId}+${Date.now()}`, permissions: { admin: true }, maxUses: 1 })

      res.json({ data: keyData.JWT });
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else if(req.method === "DELETE") {
    try {
      const { fileId } = req.query
      let { userId } = getAuth(req)

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        } else {
          userId = req.headers.authorization?.split("Bearer ")[1] as string
        }     
      }

      await pinata.files.delete([fileId as string])
      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else {
    try {
      let { userId } = getAuth(req)
      const { groupId } = req.query;

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        } else {
          userId = req.headers.authorization?.split("Bearer ")[1] as string
        }     
      }     
      let hasMore = true;
      let token = ""
      let allFiles: any[] = []

      while (hasMore) {
        let filesData;
        if (token && groupId) {
          filesData = await pinata.files.list().group(groupId as string).metadata({ userId: userId }).pageToken(token)
        } else if(token) {
          filesData = await pinata.files.list().metadata({ userId: userId }).noGroup(true).pageToken(token)
        } else if (groupId) {
          filesData = await pinata.files.list().group(groupId as string).metadata({ userId: userId })
        } else {
          filesData = await pinata.files.list().metadata({ userId: userId }).noGroup(true)
        }

        allFiles = [...filesData.files, ...allFiles]
        if (!filesData.next_page_token) {
          hasMore = false;
        } else {
          token = filesData.next_page_token
        }
      }

      return res.json({ data: allFiles })
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error")
    }
  }
}
