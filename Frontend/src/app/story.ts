import { APIUser } from 'discord-api-types/v10';

export interface Story {
    id: number;
    user: APIUser;
    date: string;
    content: string;
}