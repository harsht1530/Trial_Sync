const mongoose = require('mongoose');
const HubTrial = require('./backend/trial-copilot-hub/models/HubTrial');

async function test() {
  await mongoose.connect('mongodb+srv://gmbdashboardsupport_db_user:2YQePHIBoH4ABt4t@clinik.gvpxoln.mongodb.net/CLINIK?appName=Clinik');
  
  const siteId = 'SITE-NY-001';
  const activeTrials = await HubTrial.find({ siteId, status: { $ne: 'Closeout' } });
  
  console.log(`Found ${activeTrials.length} active trials for siteId ${siteId}`);
  
  if (activeTrials.length === 0) {
    const allTrials = await HubTrial.find({});
    console.log(`Total trials in DB: ${allTrials.length}`);
    if (allTrials.length > 0) {
      console.log(`Sample trial:`, allTrials[0]);
    }
  }
  
  process.exit(0);
}

test();
