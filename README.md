# ReVanced Extended Builder

This project will allow you to download the APK of [supported](https://github.com/inotia00/revanced-patches/tree/revanced-extended#-patches) apps and build ReVanced Extended easily!

## Required

You'll need at least [Zulu JDK 17](https://www.azul.com/downloads/?version=java-17-lts&package=jdk) and [ADB](https://developer.android.com/studio/command-line/adb) (optional, required only for rooted phones).

If you plan to use it from source, you'll also require [Node.js >= 16](https://nodejs.org/).

## How to use

If you are on a PC, download the latest executable from [here](https://github.com/inotia00/rvx-builder/releases/latest) or if you are on a Android device, please see [this](https://github.com/inotia00/rvx-builder/wiki/How-to-use-rvx-builder-on-Android).

**NOTE: If you intend to build the rooted version of either YouTube or YouTube Music, you must have the stock YouTube app to be the same version as the one chosen for building. Otherwise, the build will fail.**

## For developers

For developers, see [this](https://github.com/inotia00/rvx-builder/blob/revanced-extended/DEVELOPERS.md)

## How to use (Docker)

Required [docker](https://docs.docker.com/get-docker/) and [docker-compose(for linux cli)](https://docs.docker.com/compose/install/linux/) must be installed.

**Note: If using Docker Desktop, docker-compose will already be pre-installed.**

Clone the repository and cd into the directory `rvx-builder`

**Note: Make sure you are in the `revanced-extended` branch, you can make sure of that by doing a `git checkout revanced-extended` when cloned into `rvx-builder`**

Build using docker-compose

```
docker-compose build --no-cache
```

this is to build the docker image ( `--no-cache` is used to build the image from scratch otherwise without this creates version conflicts)
after building

```
docker-compose up -d
```

this will make your container up and running on `http://localhost:8000`

To stop your container

```
docker-compose down
```

**Note: docker-compose uses docker-compose.yml so make sure you are in the same directory `rvx-builder`**

To update to newer version of builder, stop existing container if running and build the image again and start the container again

Build using docker only

```
docker build . -t <name_of_the_image> --no-cache
```

this will create a docker image

```
docker run -d --name <name_of_container> -p 8000:8000 --restart unless-stopped -v ./revanced/:/app/rvx-builder/revanced/ <name_of_the_image>
```

this will make container up and running on `http://localhost:8000`

to stop the container

```
docker rm <name_of_container> -f
docker rmi <name_of_the_image> -f
```

To update to newer version of builder, stop existing container if running and build the image again and start the container again

In both the builds a persistent storage is kept so all the builds are stored in `rvx-builder/revanced/` 
