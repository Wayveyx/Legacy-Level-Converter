# Legacy Level Converter
[![Node.js](https://github.com/Wayveyx/Legacy-Level-Converter/actions/workflows/node.js.yml/badge.svg)](https://github.com/Wayveyx/Legacy-Level-Converter/actions/workflows/node.js.yml)

The legacy level converter is a Geometry Dash level converter made for converting levels made in 2.1 to older versions of the game. This converter supports 1.0-1.8. For 1.9, feel free to use zmx's [GD Level Converter](https://github.com/qimiko/gdlevelconverter)

## How do I use it?

**First,** you’ll need [Node.js](https://nodejs.org/).
Once that is installed, you will need a command line. On Windows, this is known as the command prompt, and can be launched by typing `cmd` in windows search, or using `Win+R` and using run. For linux users, this is simply Terminal, and can be accessed easily with `Ctrl+Alt+T`.

**Next,** navigate to the folder the converter is in. Once you’re there, Windows users can use the address bar to launch a command line by typing `cmd` in the address bar and pressing `Enter`. Linux users however can use the `cd` command in the terminal to navigate their way to the folder.

**Once inside the folder,** you can set up the configuration inside `conf.json` before running `npm install` to install all required dependencies.\
After this is done, you can run `node main.js <levelID>` to convert a level. If you would like to change settings on the fly, there are command line options you may use. Those will be listed below.

*An example showing the use of syntax. Made using a dry run.*
![Example](https://media.discordapp.net/attachments/688499058540675112/1060478381487046699/image.png)

## What options do I have?
  -h, --unlisted          Reupload level as unlisted. \
  -u, --url               Change target download server. \
  -s, --upload, --server  Change target upload server. \
  -h, --help              Show help \
      --version           Show version number \
As always, there is `--help`. This will list them all for you.

![Options](https://media.discordapp.net/attachments/817367076036411402/1060476021889056809/image.png)
