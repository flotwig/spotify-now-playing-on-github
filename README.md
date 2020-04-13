spotify-now-playing-on-github
=====

**Public instance: https://np.chary.us/**

This is a tool that replicates your "Now Playing" status from Spotify to GitHub, so it shows up as your user status on your profile. It looks something like this:

<center>

![Screenshot of Now Playing on GitHub profile](./src/frontend/assets/ss.png)

</center>

## Contributing

Contributions are welcome. Please feel free to open an issue or a pull request.

To run this repo locally using `docker-compose` to stand up postgres:

1. Obtain a Spotify web API client ID and client secret.
2. Obtain a GitHub API client ID and client secret.
3. Create a `.env` file and populate it with (at the minimum) these variables:
    ```
    BASE_URL=https://your-url.example.com
    SPOTIFY_CLIENT_ID=...
    SPOTIFY_CLIENT_SECRET=...
    GITHUB_CLIENT_ID=...
    GITHUB_CLIENT_SECRET=...
    COOKIE_SECRET=some-long-random-string
    DB_URL=postgres://postgres:somepassword@postgres
    POSTGRES_PASSWORD=somepassword
    ```
    See `config.ts` for other available environment variables.
4. Now, you should be able to use `docker-compose up` to begin file-watching and auto-rebuilding the React frontend and Node.js backend. By default, it will listen on port 4000.
