const ics = require('ics'),
    moment = require('moment'),
    { HLTV } = require('hltv'),
    fs = require('fs'),
    util = require('util'),
    express = require('express'),
    // logFile = fs.createWriteStream(__dirname + '/var/log/debug.log', {flags: 'w'}),
    app = express(),
    teams = [5378, 8813, 10494, 8068, 10426, 8248, 7681, 9797, 8209],
    server = app.listen(8080, () => {
        console.log('listening...');
    });

let matches = [];

// console.log = function(d) {
//     logFile.write(util.format(d) + '\n');
// };

HLTV.getMatches().then((result) => {
    for (var i = 0; i <= result.length - 1; i++) {
        if( typeof result[i]['team1'] != 'undefined' || typeof result[i]['team2'] != 'undefined' ) {
            if(teams.includes(result[i]['team1']['id']) || teams.includes(result[i]['team2']['id'])) {
                if(typeof result[i]['date'] != 'undefined') {

                    let match_day = moment(new Date(result[i]['date'])).locale('pl'),
                        year = parseInt(match_day.format('YYYY')),
                        month = parseInt(match_day.format('MM')),
                        day = parseInt(match_day.format('DD')),
                        hour = parseInt(match_day.format('HH')),
                        minutes = parseInt(match_day.format('mm'));

                    let match = {
                        start: [year, month, day, hour, minutes],
                        duration: {hours: Number(result[i]['format'].replace(/^BO+/i, '')), minutes: 0},
                        title: result[i]['team1']['name'] + " vs. " + result[i]['team2']['name'],
                        url: 'https://hltv.org',
                    };

                    matches.push(match);
                }
            }
        }
    }

    let { error, value } = ics.createEvents(matches);

    if (error) {
        console.log(error);
    }

    app.get('/', function (req, res) {
        res.set('Content-Type', 'text/calendar; charset=utf-8');
        res.set('Content-Disposition', 'attachment; filename=invite.ics');
        res.send(value);
    });
});
