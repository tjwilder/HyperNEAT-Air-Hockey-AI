var communicator
(function () {
    communicator = this
    //communicator = this
    this.iHub = $.connection.impactHub
    this.ready = false
    this.waiting = false
    this.lastMessage = ''
    this.callback = []
    this.iHub.client.outputs = function (message) {
        if (!communicator.waiting || !message) {
            return
        }
        var data = JSON.parse(message)
        if (data.type in communicator.callback) {
            if (communicator.callback[data.type](data.message))
                communicator.waiting = false
            else
                communicator.send(lastMessage)
        }
    }
    // Start the connection.
    $.connection.hub.start().done(function () {
        communicator.ready = true
    })

    this.subscribe = function (type, callback) {
        communicator.callback[type] = callback
    }

    this.send = function (message) {
        if (communicator.ready) {
            communicator.waiting = true
            communicator.lastMessage = message
            communicator.iHub.server.send(message)
        }
        else
            setTimeout(communicator.send, 200, message) //Try to send the message later
    }

    this.exclusiveSend = function (message, force) {
        if (communicator.waiting) {
            if (communicator.force) {
                setTimeout(communicator.exclusiveSend, 200, message, force)
                return true
            }
            return false
        }
        if (communicator.ready) {
            communicator.waiting = true
            communicator.lastMessage = message
            communicator.iHub.server.send(message)
        }
        else
            setTimeout(communicator.exclusiveSend, 200, message, force) //Try to send the message later
        return true
    }
})()