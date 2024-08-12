// let ipBlocklist = {};

// exports.addIp = (ipAddress) => {
//   ipBlocklist[ipAddress] = true;
// };

// exports.checkIp = (ipAddress) => {
//   return Object.prototype.hasOwnProperty.call(ipBlocklist, ipAddress);
// };
let ipBlocklist = {};
let ipAttempts = {};

const BLOCK_DURATION = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

exports.addIpAttempt = (ipAddress) => {
  if (!ipAttempts[ipAddress]) {
    ipAttempts[ipAddress] = { attempts: 0, timeout: null };
  }

  ipAttempts[ipAddress].attempts += 1;

  if (ipAttempts[ipAddress].attempts >= MAX_ATTEMPTS) {
    ipBlocklist[ipAddress] = true;

    ipAttempts[ipAddress].timeout = setTimeout(() => {
      delete ipBlocklist[ipAddress];
      ipAttempts[ipAddress].attempts = 0;
    }, BLOCK_DURATION);
  }
};

exports.checkIp = (ipAddress) => {
  return Object.prototype.hasOwnProperty.call(ipBlocklist, ipAddress);
};
