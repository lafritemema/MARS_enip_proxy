
/**
 * Convert an IP string under number
 * @param {string} ipString ip string
 * @return {number} ip under number format
 */
export function convertIp2Num(ipString:string):number {
  let ipTemp:number|string[]|number[];
  const errorMsg = `ERROR: IP address <${ipString}> is not conform.`;

  ipTemp = ipString.split('.');

  if (ipTemp.length == 4) {
    try {
      ipTemp = ipTemp.map((ipEl:string)=>checkAndParseIpEl(ipEl));
      ipTemp = Buffer.from(ipTemp).readUInt32LE();
      return ipTemp;
    } catch (error) {
      throw new Error(errorMsg +'\n'+(error as Error).message);
    }
  } else {
    // eslint-disable-next-line max-len
    throw new Error(errorMsg +`\nNumber of Address IP element is not conform <${ipTemp.length}> instead of 4`);
  }
}

/**
 * Convert an IP number under string
 * @param {number} ipNum IP address under number format
 * @return {string} ip under string format
 */
export function convertNum2Ip(ipNum:number) {
  const maxIpNum = Buffer.from([255, 255, 255, 255]).readUInt32BE();
  if (ipNum < maxIpNum) {
    const ipBuffer = Buffer.alloc(4);
    ipBuffer.writeUInt32LE(ipNum);
    return Array.from(ipBuffer).join('.');
  } else {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The IP number <${ipNum}> is not conform, must be lower than ${maxIpNum}.`);
  }
}


/**
 * transform an IP address element under string format to nmeric format
 * and check if it is in the good range
 * @param {string} ipEl IP address element under string format
 * @return {number} Ip address element under numeric format
 */
function checkAndParseIpEl(ipEl:string):number {
  const ipNum = Number.parseInt(ipEl);
  if (ipNum <= 255 && ipNum >= 0) {
    return ipNum;
  } else {
    throw new Error(`IP element <${ipEl}> is out of range.`);
  }
}


