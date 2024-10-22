import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";
import { getTestUser } from '@/middleware';

export const dynamic = 'force-dynamic';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "GET") {
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

      if(!req.query.cid) {
        return res.status(400).json({ error: 'CID query required' })
      }

      const signedUrl = await pinata.gateways.createSignedURL({ cid: req.query.cid as string, expires: 30000 })

      res.json({ data: signedUrl });
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } 
}
