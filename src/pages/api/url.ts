import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "GET") {
    try {
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
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
