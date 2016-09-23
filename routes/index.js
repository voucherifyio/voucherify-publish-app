'use strict'

const _                 = require('lodash')
const config            = require('config').get('app')
const express           = require('express')
const voucherify        = require('voucherify')

const applicationKeys = {
    applicationId: process.env.APPLICATION_ID || _.get(config, 'applicationKeys.applicationId'),
    applicationSecretKey: process.env.APPLICATION_SECRET_KEY || _.get(config, 'applicationKeys.applicationSecretKey')
}

const campaignName = process.env.CAMPAIGN_NAME || _.get(config, 'campaignName')

const voucherifyClient = voucherify({
    applicationId: applicationKeys.applicationId,
    clientSecretKey: applicationKeys.applicationSecretKey
})

const PUBLISH_CHANNEL = "distribution-test-app"

const Routes = function () {
    const router = express.Router()

    router.get('/', (req, res) => {
        res.render('index')
    })

    router.post('/publish', (req, res) => {
        const customer = req.body.customer

        voucherifyClient.customer.create({
            name: `${customer.name} ${customer.surname}`,
            email: customer.email,
            source_id: customer.email
        }).then((customer) => {
            return voucherifyClient.publish({
                campaign: campaignName,
                channel: PUBLISH_CHANNEL,
                customer: customer.id
            })
        }).then((result) => {
            res.json(result)
        }).catch((err) => {
            console.error('[Publish] Error: %s, Stack: %j', err, err.stack)
            res.status(500).json({message: 'Internal Server Error'})
        })
    })

    return router
}

module.exports = Routes
