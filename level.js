class level {
    constructor(levelString) {
        if(levelString.match(/;/g).length <= 1) return console.error("Level empty or invalid.")
        if(levelString.endsWith(";")) levelString = levelString.slice(0, -1)
        this.header = levelString.split(";")[0]
        this.objects = levelString.split(";").slice(1)
        this.objectCount = this.objects.length;
    }
    static defineHeader(header) { //Converting the header to a readable object.
        const { legacyValues } = require('./objCharts')
        let hObj = this.robArray(header, ',')
        let hDict = {};
        if(hObj['kS38']) {
            let cols = hObj['kS38'].slice(0, hObj['kS38'].length - 1).split('|')
            Object.keys(cols).forEach(key => {
                let col = this.robArray(cols[key], '_')
                if(legacyValues[col['6']]) {
                    hDict[col['6']] = {
                        red: col['1'],
                        green: col['2'],
                        blue: col['3']
                    }
                }
                i++;
            }, i)
        }
        return hDict;
    }
    static header(header, target) {//Building the header
        /**
         * BG: kS1-kS3
         * GR: kS4-kS6
         * LINE: kS7-kS9
         * OBJ: kS10-kS12
         * COL1: kS13-kS15
         * UNUSED: kS16-kS20
         */
        const { legacyValues } = require('./objCharts')
        let legacyHeader = "";
        let hDict = this.defineHeader(header)
        let kA = header.split(',').slice(2)
        let i = 0, x = 0;
        Object.keys(hDict).forEach(key => {
            Object.keys(hDict[key]).forEach(subkey => {
                legacyHeader += `${legacyValues[key][subkey]},${hDict[key][subkey]},` //lol this is odd
                x++;
            })
            i++;    
        })
        legacyHeader += kA;
        return legacyHeader;
    }
    static plist(file) { //Plist parser
        const plist = require('plist')
        file = `<plist>${ //Replace Rob's abbreviations with actual types. Parser doesn't like abbreviations.
                    file.replace(/d>/g, 'dict>')
                    .replace(/k>/g, 'key>')
                    .replace(/s>/g, 'string>')
                    .replace(/i>/g, 'integer>')
                    .replace(/<t\/>/g, '<true\/>')
                    .replace(/<f\/>/g, '<false\/>')
                }</plist>`
        let data = plist.parse(file)
        return data;
        
    }
    static robArray(str, char = ",") { //Much better.
        if(str.length == 0 || str == undefined) return str;
        let strArray = str.split(char)
        let parsedStr = new Object()
        for(let i = 0; i < strArray.length; i++) { //Converting array to usable object
            if(i == 0 || i % 2 == 0) {//Key value pair
                parsedStr[strArray[i]] = strArray[i + 1]
            }
        }
        return parsedStr;
    }
    static perVersion(version) {
        let max, gameVersion, songs;
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