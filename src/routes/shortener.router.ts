import { Router } from "express";

const router = Router();

const servers = [{ name: "sf64", alt: "starfox64", id: "tuwdmuTTqc" }];

router.get("/:sv", (req, res) => {
  const sv = req.params.sv;
  const server = servers.find((s) => s.name === sv || s.alt === sv);
  if (!server) {
    res.status(404).send("Server not found");
  } else {
    res.redirect(`https://discord.gg/${server.id}`);
  }
});

export default router;
