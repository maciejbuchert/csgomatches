const ics = require('ics'),
    moment = require('moment'),
    { HLTV } = require('hltv'),
    fs = require('fs'),
    util = require('util'),
    express = require('express'),
    // logFile = fs.createWriteStream(__dirname + '/var/log/debug.log', {flags: 'w'}),
    app = express(),
    teams = [10549, 8813, 10494, 8068, 10426, 8248, 7681, 9797, 8209],
    server = app.listen(process.env.PORT || 8080, () => {
        console.log('listening...');
    });

// console.log = function(d) {
//     logFile.write(util.format(d) + '\n');
// };


app.get('/', function (req, res) {
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename=invite.ics');

    let matches = [];

    HLTV.getMatches().then((result) => {
        for (i in result) {
            if (typeof result[i]['team1'] != 'undefined' || typeof result[i]['team2'] != 'undefined') {
                if (teams.includes(result[i]['team1']['id']) || teams.includes(result[i]['team2']['id'])) {
                    if (typeof result[i]['date'] != 'undefined') {
                        matches.push(getMatchObject(result[i]));
                    }
                }
            }
        }

        let {error, value} = ics.createEvents(matches);

        if (error) {
            console.log(error);
        }

        res.send(value);
    });
});


function getMatchObject(data) {
    let match_day = moment(new Date(data['date'])).locale('pl'),
        year = parseInt(match_day.format('YYYY')),
        month = parseInt(match_day.format('MM')),
        day = parseInt(match_day.format('DD')),
        hour = parseInt(match_day.format('HH')),
        minutes = parseInt(match_day.format('mm'));

    return match = {
        start: [year, month, day, hour, minutes],
        duration: {hours: Number(data['format'].replace(/[^0-9]/g, '')), minutes: 0},
        title: data['team1']['name'] + " vs. " + data['team2']['name'],
        url: 'https://hltv.org',
    };
}
