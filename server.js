const ics = require('ics'),
    moment = require('moment'),
    { HLTV } = require('hltv'),
    fs = require('fs'),
    util = require('util'),
    express = require('express'),
    // logFile = fs.createWriteStream(__dirname + '/var/log/debug.log', {flags: 'w'}),
    app = express(),
    countryTeams = [],
    server = app.listen(process.env.PORT || 8080, () => {
        console.log('listening...');
    });

// console.log = function(d) {
//     logFile.write(util.format(d) + '\n');
// };


app.get('/', function (req, res) {
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename=invite.ics');

    HLTV.getTeamRanking({country: 'Poland'}).then((teams) => {
        for(i in teams) {
            let team = teams[i];
            countryTeams.push(team.team.id);
        }

        let matches = [];

        HLTV.getMatches().then((result) => {
            for (i in result) {
                if (typeof result[i]['team1'] != 'undefined' || typeof result[i]['team2'] != 'undefined') {
                    if (countryTeams.includes(result[i]['team1']['id']) || countryTeams.includes(result[i]['team2']['id'])) {
                        if (typeof result[i]['date'] != 'undefined') {
                            matches.push(getMatchObject(result[i], req.query.alarm));
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
});


function getMatchObject(data, alarm) {
    let match_day = moment(new Date(data['date'])).locale('pl'),
        year = parseInt(match_day.format('YYYY')),
        month = parseInt(match_day.format('MM')),
        day = parseInt(match_day.format('DD')),
        hour = parseInt(match_day.format('HH')),
        minutes = parseInt(match_day.format('mm')),
        alarms = [];

    if('true' === alarm) {
        alarms.push({
            action: 'audio',
            trigger: {hours:1,minutes:0,before:true},
            repeat: 1,
            attachType:'VALUE=URI',
            attach: 'Glass'
        });
    }

    return match = {
        start: [year, month, day, hour, minutes],
        duration: {hours: Number(data['format'].replace(/[^0-9]/g, '')), minutes: 0},
        title: data['team1']['name'] + " vs. " + data['team2']['name'],
        url: "http://hltv.org/matches/" + data.id + "/match",
        description: "Developed by Maciej Buchert (twitter.com/maciejbuchert)",
        alarms: alarms,
    };
}
