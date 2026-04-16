import { NetworkRouter } from "@app/socket/network.types";
import { getPublicKeys } from "@net-controller/pub-keys.controller";

const router = new NetworkRouter();

router.bind("/pub-keys", getPublicKeys);

export default router;
