import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ChatError, ChatMessage, ChatService, ChatUser } from '../../services/chat.service';
import { Chat } from './chat';

// ChatService falso: el componente se prueba sin servidor de sockets.
// Con los Subjects se simula lo que llegaría por el socket.
class FakeChatService {
  connectionStatus$ = new BehaviorSubject<boolean>(false);
  connectionError$ = new Subject<Error>();
  history$ = new Subject<ChatMessage[]>();
  messages$ = new Subject<ChatMessage>();
  chatError$ = new Subject<ChatError>();
  onlineUsers$ = new BehaviorSubject<string[]>([]);
  users: ChatUser[] = [
    { _id: 'b-user', name: 'Usuario' },
    { _id: 'a-admin', name: 'Admin' },
    { _id: 'c-ana', name: 'Ana' },
  ];
  connect = vi.fn();
  disconnect = vi.fn();
  joinRoom = vi.fn();
  sendMessage = vi.fn();
  getUsers = () => of(this.users);
}

const message = (room: string, text: string): ChatMessage => ({
  _id: `${room}-${text}`,
  room,
  user: { _id: 'b-user', name: 'Usuario' },
  text,
  timestamp: '2026-10-05T10:00:00.000Z',
});

describe('Chat', () => {
  let fixture: ComponentFixture<Chat>;
  let component: Chat;
  let chat: FakeChatService;

  beforeEach(async () => {
    localStorage.clear();
    // Sesión del admin, cuyo id es a-admin
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: 'a-admin', name: 'Admin', email: 'a@b.c', role: 'admin' }),
    );
    chat = new FakeChatService();

    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [{ provide: ChatService, useValue: chat }, AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('connects on start and joins the general room once connected', () => {
    expect(chat.connect).toHaveBeenCalled();
    expect(chat.joinRoom).not.toHaveBeenCalled();

    chat.connectionStatus$.next(true);

    expect(chat.joinRoom).toHaveBeenCalledWith('general');
  });

  it('does not offer a direct chat with oneself', () => {
    expect(component.users().map((user) => user._id)).toEqual(['b-user', 'c-ana']);
  });

  it('builds the same direct room name for both users (ids sorted)', () => {
    chat.connectionStatus$.next(true);
    component.setChatLevel('direct');
    component.selectDirectUser('b-user');

    expect(component.activeRoom()).toBe('direct:a-admin:b-user');
    expect(chat.joinRoom).toHaveBeenLastCalledWith('direct:a-admin:b-user');
  });

  it('only shows the messages of the active room', () => {
    chat.history$.next([message('general', 'uno')]);
    chat.messages$.next(message('general', 'dos'));
    chat.messages$.next(message('group:otro', 'de otra sala'));

    expect(component.messages().map((m) => m.text)).toEqual(['uno', 'dos']);
  });

  it('shows the errors sent by the server', () => {
    chat.chatError$.next({ message: 'No puedes entrar en esta sala.' });

    expect(component.error()).toBe('No puedes entrar en esta sala.');
  });

  it('disconnects the socket when leaving the page', () => {
    fixture.destroy();

    expect(chat.disconnect).toHaveBeenCalled();
  });

  it('lists the connected users first and counts them, including oneself', () => {
    chat.connectionStatus$.next(true);
    chat.onlineUsers$.next(['a-admin', 'b-user']);

    expect(component.people().map((p) => [p.name, p.online])).toEqual([
      ['Usuario', true],
      ['Ana', false],
    ]);
    expect(component.onlineCount()).toBe(2);
  });

  it('opens the direct chat when a user of the list is clicked', () => {
    chat.connectionStatus$.next(true);
    component.openDirect('c-ana');

    expect(component.chatLevel()).toBe('direct');
    expect(component.activeRoom()).toBe('direct:a-admin:c-ana');
    expect(chat.joinRoom).toHaveBeenLastCalledWith('direct:a-admin:c-ana');
  });
});
