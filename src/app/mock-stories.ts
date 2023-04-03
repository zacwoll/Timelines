import { APIUser } from 'discord-api-types/v10';
import { Story } from './story';
import { Users } from './mock-users';


const Nelly = Users[0];
export const STORIES: Story[] = [
    {
        id: 1,
        user: Nelly,
        date: "4/3/2023",
        content: "Nelly is on the Timeline!!"
    }
]