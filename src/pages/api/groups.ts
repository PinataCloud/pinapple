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
      const { groupName } = req.body
      const { userId } = getAuth(req)

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        }        
      }

      await pinata.groups.create({ name: `${userId}+${groupName}` });
      res.send("Success");
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else if(req.method === "DELETE") {
    try {
      const { groupId } = req.query
      console.log(groupId)
      const { userId } = getAuth(req)

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        }        
      }

      await pinata.groups.delete({groupId: groupId as string})
      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else if(req.method === "PUT") { 
    try {
      const { userId } = getAuth(req)

      if (!userId) {
        //  check if local test user
        const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
        if(!testUser) {
          return res.status(401).json({ error: 'Not authenticated' })
        }        
      }

      const { fileId, folderId } = req.body;
      await pinata.groups.addFiles({groupId: folderId, files: [fileId] });
      res.send("Success")
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error")
    }
  } else {
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

      let hasMore = true;
      let token = ""
      let allGroups: any[] = []

      while(hasMore) {
        let groupsData;
        if(token) {
          groupsData = await pinata.groups.list().pageToken(token)
        } else {
          groupsData = await pinata.groups.list()
        }

        const userGroups = groupsData.groups.filter((g) => g.name.includes(userId))
        allGroups = [...userGroups, ...allGroups]
        if(!groupsData.next_page_token) {
          hasMore = false;
        } else {
          token = groupsData.next_page_token
        }
      }      
      res.json({ data: allGroups.filter((g) => g.name.includes(userId)) })
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error")
    }
  }
}
