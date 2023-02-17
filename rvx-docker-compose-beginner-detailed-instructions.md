### These are the Windows 10/11 `docker-compose` instructions for beginners to run the rvx-builder in a clean docker container:

**Please follow each step carefully and make sure you read everything.**

1. Install [`Git`](https://git-scm.com/) if you don't have it already. If you are not sure, install it.

2. Install and open [`Docker Desktop`](https://www.docker.com/products/docker-desktop/), it has to be running in the background for you to be able to run the builder container. Wait for it to load completely.

If you're running Windows 11, you can open your PowerShell terminal and install both of the above requirements with this command:
```
winget install --id=Git.Git -e  && winget install --id=Docker.DockerDesktop -e --accept-package-agreements
```

3. After you install both I recommend creating a new empty folder and performing the next steps inside it for better organization.

4. Right click inside the newly created folder and select "Open in Terminal" or "Open PowerShell Here" in the context menu.

5. Now that you have a Terminal running, run:
```
git clone -b revanced-extended https://github.com/inotia00/rvx-builder --depth=1 --no-tags
```

6. Then run this command to get from here to the rvx-builder directory:
```
cd .\rvx-builder\
```
*Or manually reopen the Terminal inside the newly created rvx-builder repository folder.*

7. To start building with **docker-compose** run:
```
docker-compose build --no-cache
```
*This can take a while, please wait for it to finish.*

8. After building, launch the container by running:
```
docker-compose up -d
```
In your browser open [localhost:8000](http://localhost:8000) to access the builder interface.
Your built applications will be located in the **revanced** folder inside the the **rvx-builder** folder that is located in the folder you created in step 3.

9. When you are done building your applications, to stop the container you can run:
```
docker-compose down
```
Once that is done you can also stop Docker Desktop and close your Terminal window now.
<br><br>

In the future when you're running the builder again, **after starting Docker Desktop**, you can open a Terminal inside the **rvx-builder** folder and start from step 7.

<hr>

#### Additonal information for advanced users:
##### Although it's recommended to build with the --no-cache flag, you don't necessarily have to unless you want to update the builder or just being safe, that way it will use the previous image to get you running the builder quickly.

##### If you run it in this fashion, to update the builder when you want to, open the Terminal inside the rvx-builder folder, do a `git pull` to be sure, and follow the `docker-compose` instructions to build again, and you really **have to** use the `--no-cache` flag this time.
