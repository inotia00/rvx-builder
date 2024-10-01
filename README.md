# ReVanced Extended Builder

This project will allow you to download the APK of [supported](https://github.com/inotia00/revanced-patches?tab=readme-ov-file#-list-of-patches-in-this-repository) apps and build ReVanced Extended easily!

## How to use

To use on PC, see [this document](https://github.com/inotia00/revanced-documentation/blob/main/docs/rvx-builder%20(pc).md). 

To use on Android (via Termux), see [this document](https://github.com/inotia00/revanced-documentation/blob/main/docs/rvx-builder%20(android).md).

## For developers

For developers, see [this](https://github.com/inotia00/rvx-builder/blob/revanced-extended/DEVELOPERS.md)

## How to use (Docker)

Required [docker](https://docs.docker.com/get-docker/) and [docker-compose (for \*nix cli)](https://docs.docker.com/compose/install/linux/) must be installed

**Note:** If you're using Docker Desktop, `docker-compose` will be pre-installed.

Clone the repository and `cd` into the directory `rvx-builder`

### Build using `docker-compose`

```bash
docker-compose build --pull --no-cache
```

This builds the Docker image (`--no-cache` is used to build the image from scratch; sometimes the cache might cause version conflicts).

After building, launch the container (runs at `localhost:8000`):

```bash
docker-compose up -d
```

To stop the container:

```bash
docker-compose down
```

**Note: docker-compose uses docker-compose.yml so make sure you are in the same directory `rvx-builder`**

To update to a newer version, stop the existing container if it is running, build the image and start it again.

### Build using only `docker`

```bash
docker build . --pull -t <name_of_the_image> --no-cache
```

Run the newly built container:

```bash
docker run -d --name <name_of_container> -p 8000:8000 --restart unless-stopped -v ./revanced/:/app/rvx-builder/revanced/ <name_of_the_image>
```

This launches the container on `http://localhost:8000`

To stop the container:

```bash
docker rm <name_of_container> -f
docker rmi <name_of_the_image> -f
```

To update to a newer version of Builder, stop the existing container if it is running, build the container start it again.

In both the builds, a persistent storage is kept. All the builds are stored in `<path/to>/rvx-builder/revanced/`.
