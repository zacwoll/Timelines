export interface Environment {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  API_KEY: string;

  AUTHORIZE_URL: string;
  ADD_BOT_URL: string;
}

export const environment: Environment = {
  //   apiUrl: "localhost:3000/api",
  CLIENT_ID: '1088577340709281812',
  CLIENT_SECRET: 'C7NTTJlyiwjBmxBCEymJSYlDcmFb8Reo',
  API_KEY: 'ee556b9b0cfe29ab395695275e198ae54491af836ce7feacd0bd6575fa99e023',
  // Redirect_URI here?
  // API_URL: "https://discord.com/api"
  AUTHORIZE_URL:
    'https://discord.com/api/oauth2/authorize?client_id=1088577340709281812&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code&scope=guilds',
  ADD_BOT_URL:
    'https://discord.com/api/oauth2/authorize?client_id=1088577340709281812&permissions=66560&scope=bot%20applications.commands',
};
