# Legacy Level Converter
A Geometry Dash level converter for the legacy level format. This was made specifically for the 1.6 GDPS, though technically works for 1.0-1.8 with slight modifications.
## How do I use it?
First, install node.js, launch a command window, and then navigate to this project's folder.\
Using the command window, run `npm install` to install all required dependencies. Do not run node.js directly.\
Next, set the UDID in `.env` to match the current udid/extID of your reupload account.\
To convert the level, go back to your command window and simply run `node main.js <levelID>`\
NOTE: The default server is for the 1.6 GDPS. If you would like to change this for your server, you can either do so within conf.json or run `-u <URL>` with the command.
