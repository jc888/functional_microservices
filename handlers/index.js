module.exports = {
    search: require('./search'),
    services: {
        mongoQueryFromTalks: require('./search2').mongoQueryFromTalks,
        findTalks: require('./search2').findTalks,
        addSpeakers: require('./search2').addSpeakers
    }
}
