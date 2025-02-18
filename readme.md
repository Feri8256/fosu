# fosu
A minimal concept unofficial client for the rhythm game [osu!](https://osu.ppy.sh/) written in JavaScript

## Getting started
fosu requires Node.js runtime environment to be installed on your system

1. Download and install Node.js runtime with npm package manager from [here](https://nodejs.org/en/download)
2. Download this repository as a zip archive, then open the zip and copy the folder on your storage to a preferred location (avoid too deep directory structures if it's possible)
3. Navigate to the location from step 2 and run `INSTALL.bat`. This will install the dependencies of the client
4. You can create a shortcut for `START.bat` and put it on your desktop for easier and quicker access if you want

## Importing beatmaps and skins
This client offers two possible ways for content importing

- Copy your downloaded beatmap or skin files (`.osz` or `.osk`) to the imports folder, then start the client (this method is the recommended, and most user-friendly way)
- Copy beatmap folders from your official osu! installations `Songs` or `Skins` directory to fosu's `songs` or `skins` directory (for more advanced users)
> Important to note that before doing any of these import methods, close the browser client and the cmd window, then start the client again so it can detect the changes and perform all the necessary steps

> Only **png** and **wav** files accepted in skins. Any other file extensions and sprites with frame number or `@2x` suffix in their name are ignored and the default is used instead!

---

*fosu is not intended as a substitution to any of the official osu! releases (stable or lazer) and not meant to compete with other clones and implementations*