const moment = require('moment-timezone');

const getCurrentDateTime = () => {
    const timezone = process.env.TZ || 'UTC';
    return moment.tz(timezone).format();
  };

  const getTimeStamp = () => {
    const timezone = process.env.TZ || 'UTC';
    return moment.tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  };


  module.exports = {
    getCurrentDateTime,
    getTimeStamp
};