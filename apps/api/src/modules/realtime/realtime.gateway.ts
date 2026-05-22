import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // =========================
  // CONNECTION
  // =========================
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // =========================
  // DISCONNECTION
  // =========================
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // =========================
  // JOIN ORGANIZATION ROOM
  // =========================
  @SubscribeMessage('joinOrg')
  handleJoinOrg(client: Socket, organizationId: string) {
    client.join(`org:${organizationId}`);

    return {
      event: 'joined',
      organizationId,
    };
  }

  // =========================
  // SEND NOTIFICATION
  // =========================
  sendToOrganization(organizationId: string, event: string, data: any) {
    this.server.to(`org:${organizationId}`).emit(event, data);
  }
}
