module.exports = {
    search: require('./search').search,
    services: {
        findTalks: require('./search').findTalks,
        findSpeakersWithTalks: require('./search').findSpeakersWithTalks,
        joinSpeakersWithTalks: require('./search').joinSpeakersWithTalks
    }
}
