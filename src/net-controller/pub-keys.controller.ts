import type { PacketRequest, PacketResponse } from "@app/socket/network.types";
import { retrievePublicKeys } from "@services/pub-keys.service";

export const getPublicKeys = async (req: PacketRequest, res: PacketResponse) => {
  const keys = await retrievePublicKeys();
  return res.status(200).json(keys, "RETRIEVE_PUBLIC_KEYS");
}