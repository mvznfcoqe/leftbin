1. [Install Docker](https://docs.docker.com/engine/install/) for your OS
2. Download Leftbin using Git

```sh
git clone git@github.com:mvznfcoqe/leftbin.git ~/.leftbin
```

3. Setup environment files from sample

```sh
cp .env-compose.sample .env-compose
```

4. Run Leftbin using [Docker Compose](https://docs.docker.com/compose/)
```
docker compose --env-file .env-compose up -d
```
