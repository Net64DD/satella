import net from 'net';
import type { NetworkLayer } from './network.layer';

export type NetworkClient = {
  uuid: string;
  socket: net.Socket;
  connectedAt: Date;
};

export enum PacketType {
  INVALID = 0x00,
  EMPTY = 0x01,
  JSON = 0x02,
  RAW = 0x03,
}

export type PacketRequest = {
  body: Buffer;
  client: NetworkClient;
};

export type PacketHandler = (req: PacketRequest, res: PacketResponse, next?: Function) => void;

export class PacketResponse {
  _packetId: string | undefined;
  _broadcast: boolean;
  _code: number;
  _body: Buffer | undefined;
  _type: PacketType;

  constructor() {
    this._code = 1;
    this._type = PacketType.INVALID;
    this._broadcast = false;
  }

  public status (code: number): PacketResponse {
    this._code = code;
    this._type = PacketType.EMPTY;
    return this;
  };

  public json (data: any, packetId: string): PacketResponse {
    this._body = Buffer.from(JSON.stringify(data));
    this._packetId = packetId;
    this._type = PacketType.JSON;
    return this;
  }

  public raw (data: Buffer): PacketResponse {
    this._body = data;
    this._type = PacketType.RAW;
    return this;
  }

  public broadcast(): PacketResponse {
    this._broadcast = true;
    return this;
  }

  get type(): PacketType {
    return this._type;
  }

  get code(): number {
    return this._code;
  }

  get body(): Buffer | undefined {
    return this._body;
  }

  get packetId(): string | undefined {
    return this._packetId;
  }

  get is_broadcast(): boolean {
    return this._broadcast;
  }
}

export class NetworkRouter {
  private _routes: Map<string, PacketHandler[]>;

  constructor() {
    this._routes = new Map();
  }

  bind(route: string, handler: PacketHandler): void {
    if (!this._routes.has(route)) {
      this._routes.set(route, []);
    }
    this._routes.get(route)?.push(handler);
  }

  readString(buffer: Buffer, offset: number): string {
    const length = buffer.readUInt32LE(offset);
    return buffer.toString('utf-8', offset + 4, offset + 4 + length);
  }

  writeString(str: string): Buffer {
    const strBuffer = Buffer.from(str, 'utf-8');
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(strBuffer.length, 0);
    return Buffer.concat([lengthBuffer, strBuffer]);
  }

  handleRequest(req: PacketRequest, layer: NetworkLayer): void {
    const buffer = req.body;
    if(buffer.compare(Buffer.from('HM64'), 0, 4) !== 0) {
      return;
    }
    
    const type = buffer.readUInt8(4);
    const route = this.readString(buffer, 5);

    if (!route) {
      console.error('No route specified in packet');
      return;
    }

    const handlers = this._routes.get(route);
    if (!handlers || handlers.length === 0) {
      console.error(`No handlers found for route: ${route}`);
      return;
    }

    const res = new PacketResponse();
    let index = 5 + 4 + Buffer.byteLength(route, 'utf-8');

    switch (type) {
      case PacketType.JSON:
        const jsonString = buffer.toString('utf-8', index);
        try {
          req.body = Buffer.from(JSON.parse(jsonString));
        } catch (error) {
          console.error('Failed to parse JSON body:', error);
          return;
        }
        break;
      case PacketType.RAW:
        req.body = buffer.slice(index);
        break;
      default:
        console.error(`Unknown packet type: ${type}`);
        return;
    }

    for(let i = 0; i < handlers.length;) {
      const handler = handlers[i]!;
      if(handler.length === 1){
        handler(req, res);
        i++;
      } else {
        handler(req, res, () => {
          i++;
        });
      }
    }

    if(res.type === PacketType.INVALID) {
      throw new Error('Response type is invalid');
    }

    let output = Buffer.alloc(3);
    output.writeInt8(res.type, 0);
    output.writeInt16LE(res.code, 1);

    if(res.type !== PacketType.EMPTY && !res.body) {
      throw new Error('Response body is required for non-empty packet types');
    }

    output = Buffer.concat([output, res.body!]);

    if(res.is_broadcast) {
      layer.broadcast(output);
    } else {
      layer.send(req.client, output);
    }
  };

  routes(): Map<string, PacketHandler[]> {
    return this._routes;
  }
}