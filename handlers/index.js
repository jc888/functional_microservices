module.exports = {
    search: require('./search').search,
    services: {
        findTalks: require('./search').findTalks,
        addSpeakers: require('./search').addSpeakers
    }
}
