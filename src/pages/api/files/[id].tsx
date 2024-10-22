import { getAuth } from '@clerk/nextjs/server'
import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "PUT") {
    try {
      const { id } = req.query
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
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
      const { userId } = getAuth(req)

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      await pinata.files.delete([id as string])
      res.send("Success")
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  }
}
