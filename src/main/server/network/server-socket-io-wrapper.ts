import { fromEvent, Subject } from 'rxjs';
import Http from 'http';
import { Server, Socket } from 'socket.io';
import { SharedSocketIoWrapper } from '../../shared/network/shared-socket-io-wrapper';
import { ServerConfig } from '../config/server-config';

export class ServerSocketIoWrapper extends SharedSocketIoWrapper {
   private readonly connectedSubject = new Subject<Socket>();
   readonly connected$ = this.connectedSubject.asObservable();

   private readonly httpServer: Http.Server;
   private readonly socketServer: Server;

   constructor() {
      super();
      this.httpServer = Http.createServer();
      this.socketServer = new Server(this.httpServer, {
         cors: true,
      });
      fromEvent(this.socketServer, ServerSocketIoWrapper.EVENT_CONNECTED).subscribe((socket: Socket) => {
         this.connectedSubject.next(socket);
      });
      this.httpServer.listen(ServerConfig.SERVER_SOCKET_PORT);
      console.log(`Socket listening on port ${ServerConfig.SERVER_SOCKET_PORT}`);
   }
}
