# Discord Ranked Choice Timeline

Discord Ranked Choice Timeline is a real-time data-driven application that allows users to visualize a ranked choice algorithm based on a data stream from Discord. This application consists of five Dockerized components: a Node.js application, an Express web server, a PostgreSQL database, a Hasura GraphQL engine, and a data handler. This README will provide a brief overview of the application's architecture, setup instructions, and usage guidelines.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Usage Guidelines](#usage-guidelines)
- [Contributing](#contributing)
- [License](#license)

## Architecture Overview

1. **Node.js application**: The core of the application, responsible for processing and analyzing the real-time data stream from Discord.
2. **Express web server**: Serves the front-end interface and handles HTTP requests for data retrieval and manipulation.
3. **PostgreSQL database**: Stores the processed data from the Discord stream.
4. **Hasura GraphQL engine**: Provides a GraphQL API for accessing and updating the data stored in the PostgreSQL database.
5. **Data handler**: This component will be responsible for interfacing with the Discord API to fetch the data stream and pass it to the Node.js application for processing.

## Prerequisites

To run this application, you'll need the following:

- Docker
- Docker Compose
- Node.js (LTS version recommended)
- A Discord API token

## Setup Instructions

1. Clone the repository:
```
git clone https://github.com/yourusername/discord-ranked-choice-timeline.git
cd discord-ranked-choice-timeline
```

2. Create a `.env` file in the root directory and add your Discord API token:
```
DISCORD_API_TOKEN=your_discord_api_token_here
```

3. Build and run the Docker containers using Docker Compose:
```
docker-compose up --build -d
```

4. Access the application by navigating to `http://localhost:3000` in your web browser.

5. To stop the application and remove the containers, run:
```
docker-compose down
```

## Usage Guidelines

1. Connect the application to a Discord server by following the instructions provided in the application's user interface.
2. Users can view the ranked choice algorithm timeline by navigating to the corresponding page within the application.
3. Interact with the data, such as filtering or zooming, using the provided controls on the timeline page.

## Contributing

Contributions are welcome! To contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make your changes in the new branch.
4. Submit a pull request to the `main` branch with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.