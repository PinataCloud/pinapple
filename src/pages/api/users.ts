import { pinata } from "@/pinata";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === "POST") {
    try {
      if(!req.body.userId) {
        return res.status(400).json({ error: 'userId required' })
      }

      await pinata.upload.json({ userId: req.body.userId }).addMetadata({ keyvalues: { localUser: req.body.userId } });
      res.send("Success");
    } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
    }
  } else {
    const cronSecret = req.headers.authorization?.split("Bearer ")[1]
    console.log(cronSecret)
    if(!cronSecret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if(cronSecret !== process.env.PINATA_JWT) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const localUserFiles = await pinata.files.list().metadata({ testUser: "true" });
    for(const file of localUserFiles.files) {
      await pinata.files.delete([file.id])
    }
    res.send("Done");
  }
}
