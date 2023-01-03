/**
 * Coded by Wayveyx
 * Development started: 8/29/22 at 8:38 PM CST
 * 2.1 to Legacy level converter
 * Made for 1.6 GDPS
 * Credits to zmx for helping me understand the level header.
 */
require("dotenv").config()
const level = require("./level")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")
const base64 = require("base-64")
const yargs = require("yargs")
const argv = yargs
.option('list', {
	alias: 'l',
	description: 'List specific details.',
	type: 'boolean',
})
.option('dry', {
	alias: 'd',
	description: 'Don\'t save or upload level.',
	type: 'boolean',
})
.option('file', {
	alias: 'f',
	description: 'Create file, but dont upload level.',
	type: 'boolean',
})
.option('url', {
    alias: 'u',
    description: 'Change target download server.',
    type: 'string',
    default: 'http://www.boomlings.com/database/'
})
.option('upload', {
    alias: 's',
    description: 'Change target upload server.',
    type: 'string',
    default: 'http://node.wayvey.xyz/garlicbase/'
})
.help()
.version("0.2.0")
.alias('help', 'h')
.alias('upload', 'server')
.argv;

var dl = argv.url;
var parse;
var dirPath = path.join(__dirname);
fs.readdir(dirPath, async function (err, files) {
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
        await axios.post(`${dl}downloadGJLevel21.php`, `levelID=${argv._}&gameVersion=21&secret=Wmfd2893gb7`, { headers: { 'User-Agent': '' } })
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
                                resolve(parseLevel(res.data, levelData, true))
                            })
                        }
                    });
                } 
            });
	} else if(levels.length > 1) return console.log("Please only provide one level file. Found:\n" + levels.join("\n"))
    else {
        let levelData = fs.readFileSync(levels[0], 'utf-8')
        parseLevel(argv._, levelData)
    }
});

function parseLevel(string, data, web = false) {
    parse = new level(data)
    parse.name = data
    if(web) {
        let levelInfo = level.robArray(string, null, ":", 'req')
        parse.name = levelInfo[2]
        parse.desc = base64.decode(levelInfo[3])
    }
    convObjs()
}
let objChart = {
    1715: 9,
    1719: 61,
    1148: 193,
    1705: 88,
    1706: 89,
    1707: 98,
    1891: 199,
    1910: 195,
    1911: 196,
    1711: 135,
    1712: 135,
    1713: 135,
    1714: 135,
    915: 104,
    1903: 40,
    1890: 198,
    1889: 191,
    1891: 199,
    1903: 40,
    1142: 164,
    1140: 162,
    1141: 163,
    1143: 165,
    1144: 166,
    1145: 167,
    1146: 168,
    1147: 169,
    //Color objects
    1000: 29,
    1001: 30,
    1002: 104,
    1004: 105
}
let illegals = ['14', '31', '34', '37', '38', '42', '43', '44', '55', '63', '64', '79', '100', '102', '108', '109', '112', '142', '189']
let colorObjs = ['29', '30', '104', '105']
let acceptedValues = ['1', '2', '3', '4', '5', '6']
let colValues = ['7', '8', '9', '10', '11', '14']
let illegalObjs = new Array();
function convObjs() { //2.1 -> 1.6 object time
    let objects = parse.objects
    let i = 0;
    let newObj = "";
    new Promise(function(resolve, reject) {
        objects.forEach(object => {
            if(object.indexOf(",") == -1) reject(object = ""); //Remove completely illegal objects
            let objInfo = level.robArray(object)
            let tempObj = "";
            if(objInfo[1] === '899') { //Color trigger conversion
                let colorType = objInfo[23]
                if(objChart[colorType]) objInfo[1] = objChart[colorType]
            }
            if(objInfo[1] > 199 && objChart[objInfo[1]] !== undefined) objInfo[1] = objChart[objInfo[1]]
            if(illegals.indexOf(objInfo[1]) !== -1 || objInfo[1] > 199) illegalObjs.push(objInfo[1]), object = ""; //Remove non 1.6
            if(object.indexOf(",") !== -1) {
                for (const [key, value] of Object.entries(objInfo)) {
                    if(acceptedValues.includes(key) || (colorObjs.includes(`${objInfo[1]}`) && colValues.includes(key))) {
                        if(key > 1) newObj += ",", tempObj += ",";
                        newObj += `${key},${value}`;
                        tempObj += `${key},${value}`;
                    }
                }
                newObj += ";";
                tempObj = "";
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
    let header = level.header(parse.header)
    let levelString = `${header};${string}` 
    if(!argv.file) {
        console.log("Level Converted. Uploading..") 
        new Promise(function(resolve, reject) {
            axios.post(`${argv.upload}uploadGJLevel.php`, `udid=${process.env.UDID}&userName=${process.env.USERNAME}&levelID=0&levelName=${parse.name}&levelDesc=${parse.desc}&levelVersion=1&levelLength=3&audioTrack=0&gameVersion=7&levelString=${levelString}&levelReplay=0`, { headers: { 'User-Agent': '' } })
            .then(function (res) {
                if(res.data == "-1") return console.log("Upload Failed.")
                console.log(res.data)
            })
        })
    } else {
        fs.writeFile(`./${parse.name}-conv.txt`, levelString, 'utf-8', (err) => {
            if(err) console.log("Something went wrong...")
            console.log(`Level converted. Saved as: ${parse.name}-conv`);
        })
    }
}




