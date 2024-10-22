import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";
import { getTestUser } from '@/middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "PUT") {
    try {
      const { id } = req.query
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

      await pinata.files.update({ id: id as string, name: `${userId}+${req.body.newName}` })

      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else if(req.method === "DELETE") {
    try {
      const { id } = req.query
      let { userId } = getAuth(req)

      const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
      if(!testUser) {
        return res.status(401).json({ error: 'Not authenticated' })
      } else {
        userId = req.headers.authorization?.split("Bearer ")[1] as string
      }  

      await pinata.files.delete([id as string])
      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  }
}
