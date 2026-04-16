import net from 'net';
import { NetworkRouter, type NetworkClient, type PacketHandler } from './network.types';
import { Ulid, Uuid4 } from "id128";

export class NetworkLayer extends NetworkRouter {
  private _server: net.Server;
  private _clients: NetworkClient[];

  constructor() {
    super();
    this._server = net.createServer();
    this._clients = [];
  }

  public use(route: string, router: NetworkRouter): void {
    router.routes().forEach((handlers, childRoute) => {
      const fullRoute = `${route}/${childRoute}`;
      handlers.forEach((handler) => this.bind(fullRoute, handler));
    });
  }

  public onConnection(socket: net.Socket): NetworkClient {
    const clientId = Ulid.generate().toString();
    const client = {
      uuid: clientId,
      socket,
      connectedAt: new Date(),
    };
    this._clients.push(client);

    console.log(`Client connected: ${clientId}`);
    return client;
  }

  public onData(data: Buffer, client: NetworkClient): void {
    try {
      this.handleRequest({ body: data, client }, this);
    } catch (error) {
      console.error(`Error handling data from client ${client.uuid}:`, error);
    }
  }

  public onEnd(socket: net.Socket): void {
    this._clients = this._clients.filter(client => client.socket !== socket);
  }

  public on(event: string, handler: (...args: any[]) => void): void {
    this._server.on(event, handler);
  }

  public send(client: NetworkClient, data: Buffer): void {
    client.socket.write(data);
  }

  public broadcast(data: Buffer): void {
    this._clients.forEach(client => {
      client.socket.write(data);
    });
  }

  public start(port: number, multiplex: (socket: net.Socket) => void): void {
    this._server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });

    this._server.on('connection', (socket) => {
      socket.once('data', (data) => {
        if (data.length < 4) {
          socket.destroy(); // Not enough data to determine protocol, close the connection
          return;
        }

        let header = data.toString('utf8', 0, 4);
        let isHttp = ['GET ', 'POST', 'PUT ', 'HEAD', 'DELE', 'PATC', 'OPTI', 'CONN'].includes(header);

        socket.pause(); // Pause the socket until we determine the protocol

        if (isHttp) {
          socket.unshift(data);
          multiplex(socket);
        } else {
          socket.resume();
          const client = this.onConnection(socket);
          this.onData(data, client);

          socket.on('data', (data) => this.onData(data, client));
          socket.on('end', () => this.onEnd(socket));
        }
      });
    });
  }

  public stop(): void {
    this._server.close(() => {
      console.log('Server stopped');
    });
  }

  public get clients(): NetworkClient[] {
    return this._clients;
  }

  public get server(): net.Server {
    return this._server;
  }
}
