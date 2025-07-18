import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dir = path.join(process.cwd(), "public", "uploads", "allgemein");
  try {
    const files = fs.readdirSync(dir)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
    // Rückgabe: Array von Pfaden, die im <img src="..."> genutzt werden können
    const images = files.map((file) => `/uploads/allgemein/${file}`);
    res.status(200).json({ success: true, images });
  } catch {
    res.status(500).json({ success: false, error: "Fehler beim Lesen des Verzeichnisses" });
  }
} 