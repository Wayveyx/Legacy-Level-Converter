/**
 * Coded by Wayveyx
 * Development started: 8/29/22 at 8:38 PM CST
 * 2.1 to Legacy level converter
 * Made for 1.6 GDPS
 * Credits to zmx for helping me understand the level header, and for providing objCharts conversions.
 */
const config = require("./conf.json")
const level = require("./level")
const { objChart, colObjs } = require("./objCharts")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")
const base64 = require("base-64")
const isb64 = require("is-base64")
const yargs = require("yargs")
const { boolean } = require("yargs")
const argv = yargs
.option('list', {
	alias: 'l',
	description: 'List specific details.', //Does pretty much nothing currently
	type: 'boolean'
})
.option('dry', {
	alias: 'd',
	description: 'Don\'t save or upload level.',
	type: 'boolean'
})
.option('file', {
	alias: 'f',
	description: 'Create file, but dont upload level.',
	type: 'boolean'
})
.option('target', {
    alias: 't',
    description: 'Change target version.',
    type: 'string',
    default: config.target
})
.option('unlisted', {
    alias: 'h',
    description: "Reupload level as unlisted.",
    type: 'boolean'
})
.option('url', {
    alias: 'u',
    description: 'Change target download server.',
    type: 'string',
    default: config.download
})
.option('upload', {
    alias: 's',
    description: 'Change target upload server.',
    type: 'string',
    default: config.upload
})
.help()
.version("0.4.3")
.alias('help', 'h')
.alias('upload', 'server')
.argv;

var dl = argv.url;
var parse;
var dirPath = path.join(__dirname);
fs.readdir(dirPath, async function (err, files) { //Planning on rewriting this
    if(err) throw err;
    let levels = [];
	for(i = 0; i < files.length; i++) {
		let fileinfo = files[i];
		if(argv._.join("")) fileinfo = files[i].includes(argv._.join(""));
		if(fileinfo) {
			levels.push(files[i]);
		}
	}
    if(levels.length < 1) {
		console.log(`Level file not found. Attempting to download from ${dl}...`);
        await axios.post(`${dl}downloadGJLevel22.php`, `levelID=${argv._}&gameVersion=21&secret=Wmfd2893gb7`, { headers: { 'User-Agent': '' } })
            .then(function (res) {
                if(res.data == "-1") return console.log("Level not found. (" + res.data + ")");
                else {
                    let levelString = Buffer.from(res.data.split(":")[7], 'base64')
                    new Promise(function(resolve, reject) {
                        let unencrypted;
                        let levelData;
                        if(res.data.split(":")[7].startsWith("kS")) unencrypted = res.data.split(":")[7].startsWith("kS")
                        if(unencrypted) {
                            levelData = unencrypted
                            resolve(levelData)
                        } else {
                            zlib.unzip(levelString, (err, buffer) => {
                                if(err) reject(console.error(err));
                                levelData = buffer.toString()
                                resolve(parseLevel(res.data, levelData, "web"))
                            })
                        }
                    });
                } 
            });
	} else if(levels.length > 1) return console.log("Please only provide one level file. Found:\n" + levels.join("\n"))
    else {
        let levelData = fs.readFileSync(levels[0], 'utf-8')
        if(levels[0].split(".")[1] == "gmd") { //Better way to determine file extension
            levelData = level.plist(levelData)
            parseLevel(argv._, levelData, "gdshare")
        }
        else parseLevel(argv._, levelData)
    }
});

async function parseLevel(string, data, src) { //change to src - v0.4.0
    let levelInfo;
    switch(src) {
        case "web":
            //console.log(data)
            parse = new level(data)
            levelInfo = level.robArray(string, ":")
            parse.name = levelInfo[2]
            parse.desc = base64.decode(levelInfo[3], 'base64')
            parse.length = levelInfo[15]
            parse.track = levelInfo[12]
            console.log(`${parse.name} downloaded.`)
        break;
        case "gdshare": //Readablility suffers but consistency improves.
            levelInfo = Buffer.from(data.k4, 'base64');
            await new Promise(function(resolve, reject) {
                zlib.unzip(levelInfo, (err, buffer) => {
                if(err) reject(console.error(err));
                levelInfo = buffer.toString()
                resolve(levelInfo)
                })
            })
            parse = new level(levelInfo)
            parse.name = data.k2
            parse.desc = base64.decode(data.k3, '')
            parse.length = 0 //GDShare doesn't support this
            parse.track = data.k8 ? data.k8 : 0; //Only supporting 'normal' songs, <3 cyni
        break;
        default:
            parse = new level(data)
            parse.name = data;
        break;
    }
    convObjs()
}
let maxObjs = level.perVersion(argv.target).max;
let gameVersion = level.perVersion(argv.target).gameVersion;
let songs = level.perVersion(argv.target).songs
let illegals = ['14', '31', '34', '37', '38', '42', '43', '44', '55', '63', '64', '79', '100', '102', '108', '109', '112', '142', '189'] //this will probably change lol
let colorObjs = ['29', '30', '104', '105']
let acceptedValues = ['1', '2', '3', '4', '5', '6']
let colValues = ['7', '8', '9', '10', '11', '14']
let illegalObjs = new Array();
function convObjs() { //2.1 -> legacy object time
    let objects = parse.objects
    if(parse.track > songs) parse.track = 0; //Stereo Madness for invalid song
    let i = 0;
    let newObj = "";
    new Promise(function(resolve, reject) {
        objects.forEach(object => {
            if(object.indexOf(",") == -1) reject(object = ""); //Remove completely illegal objects
            let objInfo = level.robArray(object)
            let tempObj = "";
            if(objInfo[1] === '899') { //Color trigger conversion
                let colorType = objInfo[23]
                if(colObjs[colorType]) objInfo[1] = colObjs[colorType]
            }
            if(objInfo[1] > maxObjs && objChart[objInfo[1]] !== undefined) objInfo[1] = objChart[objInfo[1]]
            if(illegals.indexOf(objInfo[1]) !== -1 || objInfo[1] > maxObjs) illegalObjs.push(objInfo[1]), object = ""; //Remove bad guys
            if(object.indexOf(",") !== -1) {
                for (const [key, value] of Object.entries(objInfo)) {
                    if(acceptedValues.includes(key) || (colorObjs.includes(`${objInfo[1]}`) && colValues.includes(key))) {
                        if(key > 1) newObj += ",", tempObj += ",";
                        newObj += `${key},${value}`;
                        tempObj += `${key},${value}`;
                    }
                }
                newObj += ";";
                tempObj = ""; //used for debugging
            }
            i++;
            if(i == objects.length) {
                if(illegalObjs.length > 0) {
                    if(argv.list) console.log(illegalObjs)
                    else console.log(`${illegalObjs.length} illegal objects removed.`)
                }
                if(!argv.dry) resolve(writeFile(newObj))
                else resolve(console.log("Level converted, though not saved."))
            }
        });
    });
}
function writeFile(string) {
    let header = level.header(parse.header, argv.target)
    let levelString = `${header};${string}` 
    let unlisted  = 0;
    if(!argv.file) {
        console.log("Level Converted. Uploading..") 
        new Promise(function(resolve, reject) {
            if(config.udid == "" || config.udid == undefined) return console.log("Upload Failed! UDID required. Please contact your server administrator.")
            if(argv.unlisted) unlisted = 1;
            if(isb64(parse.desc)) parse.desc = base64.decode(parse.desc) //Secondary check for gmd files.
            axios.post(`${argv.upload}uploadGJLevel.php`, `udid=${config.udid}&userName=${config.username}&levelID=0&levelName=${parse.name}&levelDesc=${parse.desc}&levelVersion=1&levelLength=${parse.length}&audioTrack=${parse.track}&gameVersion=${gameVersion}&secret=${config.secret}&unlisted=${unlisted}&levelString=${levelString}&levelReplay=0`, { headers: { 'User-Agent': '' } })
            .then(function (res) {
                if(res.data == "-1") return console.log("Upload Failed.")
                console.log(res.data)
            })
        })
    } else {
        fs.writeFile(`./${argv._}-conv.txt`, levelString, 'utf-8', (err) => {
            if(err) console.log("Something went wrong...")
            console.log(`Level converted. Saved as: ${argv._}-conv`);
        })
    }
}