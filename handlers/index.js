module.exports = {
    search: require('./search'),
    services: {
        findTalks: require('./search2').findTalks,
        addSpeakers: require('./search2').addSpeakers
    }
}
