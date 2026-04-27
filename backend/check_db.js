const mongoose = require('mongoose');
const { hubConn } = require('./config/db');
const HubAE = require('./trial-copilot-hub/models/HubAE');

async function check() {
    try {
        if (hubConn.readyState !== 1) {
            await new Promise(resolve => hubConn.on('connected', resolve));
        }
        console.log('Connected to Hub DB');
        const count = await HubAE.countDocuments({});
        console.log('Total HubAE records:', count);
        const all = await HubAE.find({}).limit(5);
        console.log('Sample records:', JSON.stringify(all, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
