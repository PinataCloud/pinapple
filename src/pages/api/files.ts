import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "POST") {
    try {
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
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
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      await pinata.files.delete([fileId as string])
      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else {
    try {
      const { userId } = getAuth(req)
      const { groupId } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
      }      
      let hasMore = true;
      let token = ""
      let allFiles: any[] = []

      while (hasMore) {
        let filesData;
        if (token && groupId) {
          console.log("Token and group id")
          filesData = await pinata.files.list().group(groupId as string).pageToken(token)
        } else if(token) {
          console.log("Token time")
          filesData = await pinata.files.list().pageToken(token)
        } else if (groupId) {
          console.log("group id")
          filesData = await pinata.files.list().group(groupId as string)
        } else {
          console.log("No token")
          filesData = await pinata.files.list()
        }

        allFiles = [...filesData.files, ...allFiles]
        if (!filesData.next_page_token) {
          hasMore = false;
        } else {
          token = filesData.next_page_token
        }
        console.log(filesData.next_page_token)
      }
      const filteredFiles = !groupId ? allFiles.filter((f: any) => f.group_id === null) : allFiles;
      return res.json({ data: filteredFiles.filter((f) => f.name.includes(userId)) })
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error")
    }
  }
}
