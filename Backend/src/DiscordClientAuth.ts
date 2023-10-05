import axios from "axios";
import querystring from 'querystring';

export interface DiscordAuthInterface {
  loginToken: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export class Authorization {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];

  constructor(auth: DiscordAuthInterface) {
    this.clientId = auth.clientId;
    this.clientSecret = auth.clientSecret;
    this.redirectUri = auth.redirectUri;
    this.scopes = auth.scopes;
  }

  async getAccessToken(code: string): Promise<string> {
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
    };
    
    const formData = querystring.stringify(data);
    
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return tokenResponse.data.access_token;
  }

  async postAccessToken(accessToken: string) {
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "authorization_code",
      code: accessToken,
      redirect_uri: 'http://localhost:3000/access_token',
      scope: this.scopes,
    }

    const formData = querystring.stringify(data);

    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return tokenResponse.data;
  }
}
