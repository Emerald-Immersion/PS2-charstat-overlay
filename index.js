async function update(service_id = 'example', char_name = 'brakenium') {
    const fields = [
        {
            id: 'username',
            data: (data) => data.name.first,
        },
        {
            id: 'br_bar',
            data: (data) => data.battle_rank.percent_to_next + '%',
        },
        {
            id: 'br',
            data: (data) => data.battle_rank.value,
        },
        {
            id: 'kill',
            data: (data) => data.stats.kills.all_time,
        },
        {
            id: 'death',
            data: (data) => data.stats.deaths.all_time,
        },
        {
            id: 'capture',
            data: (data) => data.stats.facility_capture.all_time,
        },
        {
            id: 'defense',
            data: (data) => data.stats.facility_defend.all_time,
        },
        {
            id: 'kd',
            data: (data) => (data.stats.kills.all_time / data.stats.deaths.all_time).toFixed(2),
        },
        {
            id: 'kpm',
            data: (data) => (data.stats.kills.all_time / data.times.minutes_played).toFixed(2),
        },
        {
            id: 'spm',
            data: (data) => (data.stats.score.all_time / data.times.minutes_played).toFixed(2),
        },
        {
            id: 'played',
            data: (data) => (data.times.minutes_played / 60).toFixed(1),
        },
        {
            id: 'age',
            data: (data) => {
                const creation = new Date(data.times.creation * 1000);
                return `${creation.getDate()}/${creation.getMonth()}/${creation.getFullYear()}`
            },
        }
    ];

    const factions = [
        null,
        { abbrev: 'vs', color: 'purple' },
        { abbrev: 'nc', color: 'blue' },
        { abbrev: 'tr', color: 'red' },
        { abbrev: 'ns', color: 'darkslategrey' },
    ];
    const request_URI = encodeURI(`https://census.daybreakgames.com/s:${service_id}/get/ps2:v2/character?`
        + `name.first_lower=${char_name.toLowerCase()}`
        + '&c:join=characters_stat_history^on:character_id^inject_at:stats^list:1'
        + '^show:all_time\'stat_name\'one_life_max^terms:stat_name=deaths\'stat_name=kills\'stat_name=score\'stat_name=facility_capture\'stat_name=facility_defend'
        + '&c:show=character_id,name.first,faction_id,times.creation,times.login_count,times.minutes_played,battle_rank,prestige_level'
        + '&c:tree=start:stats^field:stat_name^list:0');
    const response = await fetch(request_URI);

    const data = (await response.json()).character_list[0];

    for (const field of fields) {
        document.getElementById(field.id).innerHTML = field.data(data);
    }

    document.getElementById('br_bar').style.width = `${data.battle_rank.percent_to_next}%`;

    document.getElementById('faction').src = `img/${factions[data.faction_id].abbrev}.png`;
    document.getElementById('prestige').src = (data.prestige_level == 1) ? 'img/asp.png' : 'img/br120.png';
    for (const element of document.getElementsByTagName('dt')) {
        element.style.color = factions[data.faction_id].color;
    }

    const updated_at = new Date();
    document.getElementById('updated_time').innerHTML = `${numberToXDigit(updated_at.getHours())}:${numberToXDigit(updated_at.getMinutes())}:${numberToXDigit(updated_at.getSeconds())}`;
}

function numberToXDigit(number) {
    return `0${number}`.slice(-2);
}

const params = new URLSearchParams(window.location.search);
const service_id = params.get('service_id') || 'example';

const auto_update = setInterval(async () => {
    update(service_id, params.get('username')).catch(console.error);
}, 20000);