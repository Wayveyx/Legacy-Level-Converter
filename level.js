class level {
    constructor(levelString) {
        if(levelString.match(/;/g).length <= 1) return console.error("Level empty or invalid.")
        if(levelString.endsWith(";")) levelString = levelString.slice(0, -1)
        this.header = levelString.split(";")[0]
        this.objects = levelString.split(";").slice(1)
        this.objectCount = this.objects.length;
    }
    static header(header) {
        let bg = this.robArray(header, 'bg', ',', 'header')
        let gr = this.robArray(header, 'gr', ',', 'header')
        let legacyHeader = `kS1,${bg[0]},kS2,${bg[1]},kS3,${bg[2]},kS4,${gr[0]},kS5,${gr[1]},kS6,${gr[2]},kS8,1`
        return legacyHeader;
    }
    static gdshare(level) { //GDShare .gmd extension support - v0.4.0
        const { XMLParser, XMLBuilder } = require("fast-xml-parser");
        let parser = new XMLParser({arrayMode: "strict"});
        let data = parser.parse(level)
        let levelInfo = data["d"]["s"] //tempted to key-value pair this
        let levelName = levelInfo[0]
        let levelDesc = levelInfo[1]
        let song = data["d"]["i"][1]
        let levelData = levelInfo[2]
        return {
            levelData,
            levelName,
            levelDesc,
            song
         }
    }
    static robArray(str, val, char = ",", type = "object") { //Heavily optimized, still horrible :troll:
        let strArray = str.split(char)
        let parsedStr = new Object()
        let colors;
        let colorArray;
        for(let i = 0; i < strArray.length; i++) { //Converting array to usable object
            if(i == 0 || i % 2 == 0) {//Key value pair
                parsedStr[strArray[i]] = strArray[i + 1]
            }
        }
        if(val) {
            switch(val) { //Header stuff
                case 'bg':
                    if(type !== 'header') return "-1";
                    colors = [parsedStr['kS1'], [parsedStr]['kS2'], parsedStr['kS3']]
                    if(parsedStr['kS38']) {
                        colorArray = parsedStr['kS38'].split("|")[0].split("_")
                        colors = [colorArray[1], colorArray[3], colorArray[5]]
                    }
                    return colors;
                break;
                case 'gr':
                    if(type !== 'header') return "-1";
                    colors = [parsedStr['kS1'], [parsedStr]['kS2'], parsedStr['kS3']]
                    if(parsedStr['kS38']) {
                        colorArray = parsedStr['kS38'].split("|")[1].split("_")
                        colors = [colorArray[1], colorArray[3], colorArray[5]]
                    }
                    return colors;
                break;
                default:
                    return parsedStr[val];
                break;
            }
        }
        return parsedStr;
    }
    static perVersion(version) {
        let max;
        let gameVersion;
        let songs;
        switch(version) {
            case "1.0":
                max = 44
                gameVersion = 1
                songs = 6
            break;
            case "1.1":
                max = 46
                gameVersion = 2
                songs = 7
            break;
            case "1.2":
                max = 47
                gameVersion = 3
                songs = 8
            break;
            case "1.3":
                max = 84
                gameVersion = 4
                songs = 9
            break;
            case "1.4":
                max = 104
                gameVersion = 5
                songs = 10
            break;
            case "1.5":
                max = 141
                gameVersion = 6
                songs = 11
            break;
            case "1.6":
                max = 199
                gameVersion = 7
                songs = 13
            break;
            case "1.7":
                max = 285
                gameVersion = 10
                songs = 14
            break;
            case  "1.8":
                max = 505
                gameVersion = 18
                songs = 15
            break;
            default:
                max = 199;
                gameVersion = 7
                songs = 13
            break;
        }
        return {
            max,
            gameVersion,
            songs
        }
    }
}

module.exports = level;